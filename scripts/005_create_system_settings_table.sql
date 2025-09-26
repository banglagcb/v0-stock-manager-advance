-- Create system_settings table for user preferences
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    currency VARCHAR(3) DEFAULT 'USD',
    tax_rate DECIMAL(5,2) DEFAULT 0.00,
    low_stock_threshold INTEGER DEFAULT 10,
    auto_reorder BOOLEAN DEFAULT false,
    email_notifications BOOLEAN DEFAULT true,
    receipt_footer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own settings" ON system_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON system_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON system_settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own settings" ON system_settings FOR DELETE USING (auth.uid() = user_id);

-- Create notifications table for system alerts
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info', -- info, warning, error, success
    is_read BOOLEAN DEFAULT false,
    action_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- Function to create low stock notifications
CREATE OR REPLACE FUNCTION create_low_stock_notifications()
RETURNS void AS $$
DECLARE
    product_record RECORD;
    user_record RECORD;
    threshold INTEGER;
BEGIN
    -- Get all users and their low stock thresholds
    FOR user_record IN 
        SELECT DISTINCT p.id as user_id, COALESCE(ss.low_stock_threshold, 10) as threshold
        FROM auth.users u
        JOIN profiles p ON u.id = p.id
        LEFT JOIN system_settings ss ON u.id = ss.user_id
    LOOP
        -- Check for low stock products for this user
        FOR product_record IN
            SELECT * FROM products 
            WHERE stock_quantity <= user_record.threshold
            AND stock_quantity > 0
        LOOP
            -- Insert notification if it doesn't exist already
            INSERT INTO notifications (user_id, title, message, type, action_url)
            SELECT 
                user_record.user_id,
                'Low Stock Alert',
                'Product "' || product_record.name || '" is running low (Stock: ' || product_record.stock_quantity || ')',
                'warning',
                '/dashboard/inventory'
            WHERE NOT EXISTS (
                SELECT 1 FROM notifications 
                WHERE user_id = user_record.user_id 
                AND title = 'Low Stock Alert'
                AND message LIKE '%' || product_record.name || '%'
                AND created_at > NOW() - INTERVAL '24 hours'
            );
        END LOOP;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create function to clean old notifications
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS void AS $$
BEGIN
    DELETE FROM notifications 
    WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;
