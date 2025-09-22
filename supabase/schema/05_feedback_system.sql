-- ============================================================================
-- FEEDBACK SYSTEM SCHEMA
-- ============================================================================
-- This file contains all feedback-related tables and configurations

-- ============================================================================
-- FEEDBACK TABLE
-- ============================================================================

-- Create feedback table to store user feedback
CREATE TABLE IF NOT EXISTS public.feedback (
    id UUID DEFAULT public.generate_uuid_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Feedback Content
    message TEXT NOT NULL,
    feedback_type VARCHAR(50) DEFAULT 'general' 
        CHECK (feedback_type IN ('general', 'bug_report', 'feature_request', 'improvement', 'complaint', 'praise')),
    
    -- Feedback Metadata
    priority VARCHAR(20) DEFAULT 'medium' 
        CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    
    status VARCHAR(20) DEFAULT 'open' 
        CHECK (status IN ('open', 'in_progress', 'resolved', 'closed', 'duplicate')),
    
    -- Contact Information
    contact_email VARCHAR(255),
    contact_name VARCHAR(100),
    
    -- System Information
    user_agent TEXT,
    browser_info JSONB DEFAULT '{}',
    device_info JSONB DEFAULT '{}',
    
    -- Response Information
    admin_response TEXT,
    admin_user_id UUID REFERENCES auth.users(id),
    responded_at TIMESTAMP WITH TIME ZONE,
    
    -- Rating (for resolved feedback)
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Constraints
    CONSTRAINT valid_message_length CHECK (length(trim(message)) >= 10),
    CONSTRAINT valid_contact_email CHECK (contact_email IS NULL OR public.is_valid_email(contact_email))
);

-- Enable RLS
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for feedback
CREATE POLICY "Users can view own feedback" ON public.feedback
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own feedback" ON public.feedback
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own feedback" ON public.feedback
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own feedback" ON public.feedback
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for feedback
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON public.feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON public.feedback(created_at);
CREATE INDEX IF NOT EXISTS idx_feedback_feedback_type ON public.feedback(feedback_type);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON public.feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_priority ON public.feedback(priority);
CREATE INDEX IF NOT EXISTS idx_feedback_rating ON public.feedback(rating);

-- Create trigger for updated_at
CREATE TRIGGER update_feedback_updated_at
    BEFORE UPDATE ON public.feedback
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- FEEDBACK CATEGORIES TABLE
-- ============================================================================

-- Create feedback categories table for organizing feedback
CREATE TABLE IF NOT EXISTS public.feedback_categories (
    id UUID DEFAULT public.generate_uuid_v4() PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6',
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Constraints
    CONSTRAINT valid_color CHECK (color ~ '^#[0-9A-Fa-f]{6}$'),
    CONSTRAINT valid_sort_order CHECK (sort_order >= 0)
);

-- Enable RLS
ALTER TABLE public.feedback_categories ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for feedback categories (read-only for users)
CREATE POLICY "Anyone can view active categories" ON public.feedback_categories
    FOR SELECT USING (is_active = true);

-- Create indexes for feedback categories
CREATE INDEX IF NOT EXISTS idx_feedback_categories_name ON public.feedback_categories(name);
CREATE INDEX IF NOT EXISTS idx_feedback_categories_is_active ON public.feedback_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_feedback_categories_sort_order ON public.feedback_categories(sort_order);

-- Create trigger for updated_at
CREATE TRIGGER update_feedback_categories_updated_at
    BEFORE UPDATE ON public.feedback_categories
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- FEEDBACK TAGS TABLE
-- ============================================================================

-- Create feedback tags table for tagging feedback
CREATE TABLE IF NOT EXISTS public.feedback_tags (
    id UUID DEFAULT public.generate_uuid_v4() PRIMARY KEY,
    feedback_id UUID NOT NULL REFERENCES public.feedback(id) ON DELETE CASCADE,
    tag_name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Constraints
    CONSTRAINT unique_feedback_tag UNIQUE(feedback_id, tag_name)
);

-- Enable RLS
ALTER TABLE public.feedback_tags ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for feedback tags
CREATE POLICY "Users can view tags for own feedback" ON public.feedback_tags
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.feedback 
            WHERE id = feedback_tags.feedback_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert tags for own feedback" ON public.feedback_tags
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.feedback 
            WHERE id = feedback_tags.feedback_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete tags for own feedback" ON public.feedback_tags
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.feedback 
            WHERE id = feedback_tags.feedback_id 
            AND user_id = auth.uid()
        )
    );

-- Create indexes for feedback tags
CREATE INDEX IF NOT EXISTS idx_feedback_tags_feedback_id ON public.feedback_tags(feedback_id);
CREATE INDEX IF NOT EXISTS idx_feedback_tags_tag_name ON public.feedback_tags(tag_name);

-- ============================================================================
-- FEEDBACK ANALYTICS TABLE
-- ============================================================================

-- Create feedback analytics table for tracking feedback metrics
CREATE TABLE IF NOT EXISTS public.feedback_analytics (
    id UUID DEFAULT public.generate_uuid_v4() PRIMARY KEY,
    date DATE NOT NULL,
    feedback_type VARCHAR(50) NOT NULL,
    total_feedback INTEGER DEFAULT 0,
    resolved_feedback INTEGER DEFAULT 0,
    avg_rating NUMERIC(3,2),
    avg_response_time_hours NUMERIC(8,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Constraints
    CONSTRAINT unique_date_type UNIQUE(date, feedback_type),
    CONSTRAINT valid_counts CHECK (total_feedback >= 0 AND resolved_feedback >= 0),
    CONSTRAINT valid_rating CHECK (avg_rating IS NULL OR (avg_rating >= 1.0 AND avg_rating <= 5.0)),
    CONSTRAINT valid_response_time CHECK (avg_response_time_hours IS NULL OR avg_response_time_hours >= 0)
);

-- Enable RLS
ALTER TABLE public.feedback_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for feedback analytics (admin only)
CREATE POLICY "Admins can view analytics" ON public.feedback_analytics
    FOR SELECT USING (true);

CREATE POLICY "System can insert analytics" ON public.feedback_analytics
    FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update analytics" ON public.feedback_analytics
    FOR UPDATE USING (true);

-- Create indexes for feedback analytics
CREATE INDEX IF NOT EXISTS idx_feedback_analytics_date ON public.feedback_analytics(date);
CREATE INDEX IF NOT EXISTS idx_feedback_analytics_feedback_type ON public.feedback_analytics(feedback_type);

-- Create trigger for updated_at
CREATE TRIGGER update_feedback_analytics_updated_at
    BEFORE UPDATE ON public.feedback_analytics
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- FUNCTIONS FOR FEEDBACK SYSTEM
-- ============================================================================

-- Function to get feedback statistics
CREATE OR REPLACE FUNCTION public.get_feedback_stats(
    days_back INTEGER DEFAULT 30
)
RETURNS TABLE(
    total_feedback BIGINT,
    open_feedback BIGINT,
    resolved_feedback BIGINT,
    avg_rating NUMERIC,
    avg_response_time_hours NUMERIC,
    feedback_by_type JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_feedback,
        COUNT(*) FILTER (WHERE status = 'open') as open_feedback,
        COUNT(*) FILTER (WHERE status = 'resolved') as resolved_feedback,
        ROUND(AVG(rating), 2) as avg_rating,
        ROUND(
            AVG(EXTRACT(EPOCH FROM (responded_at - created_at)) / 3600), 
            2
        ) as avg_response_time_hours,
        jsonb_object_agg(feedback_type, type_count) as feedback_by_type
    FROM (
        SELECT 
            feedback_type,
            COUNT(*) as type_count
        FROM public.feedback
        WHERE created_at >= NOW() - INTERVAL '1 day' * days_back
        GROUP BY feedback_type
    ) type_stats
    CROSS JOIN public.feedback
    WHERE public.feedback.created_at >= NOW() - INTERVAL '1 day' * days_back
    GROUP BY 1, 2, 3, 4, 5;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user feedback history
CREATE OR REPLACE FUNCTION public.get_user_feedback_history(
    user_uuid UUID,
    days_back INTEGER DEFAULT 90
)
RETURNS TABLE(
    id UUID,
    message TEXT,
    feedback_type VARCHAR(50),
    status VARCHAR(20),
    rating INTEGER,
    created_at TIMESTAMP WITH TIME ZONE,
    responded_at TIMESTAMP WITH TIME ZONE,
    admin_response TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        f.id,
        f.message,
        f.feedback_type,
        f.status,
        f.rating,
        f.created_at,
        f.responded_at,
        f.admin_response
    FROM public.feedback f
    WHERE f.user_id = user_uuid 
        AND f.created_at >= NOW() - INTERVAL '1 day' * days_back
    ORDER BY f.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update feedback status
CREATE OR REPLACE FUNCTION public.update_feedback_status(
    feedback_uuid UUID,
    new_status VARCHAR(20),
    admin_response TEXT DEFAULT NULL,
    admin_user_uuid UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.feedback
    SET 
        status = new_status,
        admin_response = COALESCE(admin_response, admin_response),
        admin_user_id = COALESCE(admin_user_uuid, admin_user_id),
        responded_at = CASE 
            WHEN new_status IN ('resolved', 'closed') AND responded_at IS NULL 
            THEN timezone('utc'::text, now()) 
            ELSE responded_at 
        END
    WHERE id = feedback_uuid;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate daily feedback analytics
CREATE OR REPLACE FUNCTION public.generate_daily_feedback_analytics(target_date DATE DEFAULT CURRENT_DATE)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.feedback_analytics (date, feedback_type, total_feedback, resolved_feedback, avg_rating, avg_response_time_hours)
    SELECT 
        target_date,
        feedback_type,
        COUNT(*) as total_feedback,
        COUNT(*) FILTER (WHERE status = 'resolved') as resolved_feedback,
        ROUND(AVG(rating), 2) as avg_rating,
        ROUND(
            AVG(EXTRACT(EPOCH FROM (responded_at - created_at)) / 3600), 
            2
        ) as avg_response_time_hours
    FROM public.feedback
    WHERE DATE(created_at) = target_date
    GROUP BY feedback_type
    ON CONFLICT (date, feedback_type) 
    DO UPDATE SET
        total_feedback = EXCLUDED.total_feedback,
        resolved_feedback = EXCLUDED.resolved_feedback,
        avg_rating = EXCLUDED.avg_rating,
        avg_response_time_hours = EXCLUDED.avg_response_time_hours,
        updated_at = timezone('utc'::text, now());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get feedback trends
CREATE OR REPLACE FUNCTION public.get_feedback_trends(
    days_back INTEGER DEFAULT 30
)
RETURNS TABLE(
    date DATE,
    total_feedback BIGINT,
    resolved_feedback BIGINT,
    avg_rating NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        DATE(f.created_at) as date,
        COUNT(*) as total_feedback,
        COUNT(*) FILTER (WHERE f.status = 'resolved') as resolved_feedback,
        ROUND(AVG(f.rating), 2) as avg_rating
    FROM public.feedback f
    WHERE f.created_at >= NOW() - INTERVAL '1 day' * days_back
    GROUP BY DATE(f.created_at)
    ORDER BY date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

