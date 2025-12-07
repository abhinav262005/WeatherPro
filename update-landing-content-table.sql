-- ============================================
-- Update landing_content table to add missing column
-- ============================================

USE weather_dashboard;

-- Add updated_by column
ALTER TABLE landing_content 
ADD COLUMN updated_by INT NULL AFTER content_value;

-- Add foreign key constraint
ALTER TABLE landing_content
ADD CONSTRAINT fk_landing_content_updated_by 
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;

-- Verify the change
DESCRIBE landing_content;

SELECT 'landing_content table updated successfully!' as Status;
