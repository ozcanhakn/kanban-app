export interface DescriptionTemplate {
    id: string;
    label: string;
    content: string;
}

export const DESCRIPTION_TEMPLATES: DescriptionTemplate[] = [
    {
        id: 'bug',
        label: 'Bug Report',
        content: `### 🐛 Bug Tanımı
Hatanın kısa bir özeti.

### 👣 Adımlar
1. Şuraya git...
2. Buna tıkla...
3. Hatayı gör...

### 🤔 Beklenen Davranış
Ne olması gerekiyordu?

### 📸 Ekran Görüntüleri
(Varsa ekleyin)`
    },
    {
        id: 'feature',
        label: 'Feature Request',
        content: `### 🚀 Özellik Tanımı
Ne yapılmasını istiyorsunuz?

### 🎯 Amaç
Bu özellik neden gerekli? Hangi problemi çözüyor?

### ✅ Kabul Kriterleri
- [ ] Kriter 1
- [ ] Kriter 2`
    },
    {
        id: 'task',
        label: 'Genel Görev',
        content: `### 📋 Görev Detayları
Yapılması gereken işin detayları.

### 🔗 Kaynaklar
- Link 1
- Link 2`
    }
];
