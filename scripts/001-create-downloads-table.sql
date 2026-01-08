-- İndirme sayacı tablosu oluşturma
CREATE TABLE IF NOT EXISTS downloads (
  id SERIAL PRIMARY KEY,
  file_name TEXT NOT NULL UNIQUE,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Başlangıç verileri ekleme (tüm dosyalar için)
INSERT INTO downloads (file_name, download_count) VALUES
  ('j_player.bat', 0),
  ('jw_player.bat', 0),
  ('link.txt', 0),
  ('link2.txt', 0),
  ('link3.txt', 0),
  ('link4.txt', 0),
  ('comment.zip', 0),
  ('comnent.zip', 0)
ON CONFLICT (file_name) DO NOTHING;

-- RLS politikası - herkes okuyabilir
ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read downloads" ON downloads
  FOR SELECT USING (true);

CREATE POLICY "Anyone can update downloads" ON downloads
  FOR UPDATE USING (true);
