# Modern Kanban Uygulaması

Bu proje, React 19 ve TypeScript kullanılarak geliştirilmiş, yüksek performanslı, erişilebilir ve modern bir Kanban yönetim uygulamasıdır. Supabase altyapısı ile gerçek zamanlı veri senkronizasyonu sağlar.

## 🚀 Özellikler

### Temel Fonksiyonlar
*   **Board Yönetimi:** Sınırsız sayıda Kanban tahtası oluşturma, düzenleme ve silme.
*   **Gelişmiş Sürükle & Bırak:** Board içindeki kartları ve sütunları sürükleyip bırakarak organize etme (@dnd-kit).
*   **Gerçek Zamanlı Senkronizasyon:** Yapılan tüm değişiklikler Supabase sayesinde anında veritabanına kaydedilir.
*   **Kişiselleştirme:** Board başlıklarını ve içeriklerini kolayca düzenleyebilme.

### Kullanıcı Deneyimi (UX)
*   **Karanlık/Aydınlık Mod:** Sistem tercihinize duyarlı veya manuel olarak değiştirilebilen tema desteği.
*   **Klavye Kısayolları:** Klavye ile hızlı gezinme ve işlem yapabilme (Kısayollar menüsü için `?` tuşuna basın).
*   **Erişilebilirlik (A11y):** Ekran okuyucularla tam uyumlu, klavye dostu arayüz ve ARIA standartlarına uygun yapı.
*   **Toast Bildirimleri:** İşlem sonuçları hakkında kullanıcıya anlık geri bildirimler (Başarılı, Hata vb.).
*   **Yükleme Durumları:** Veri yüklenirken gösterilen Skeleton ekranlar ile akıcı bir deneyim.

### Teknik Özellikler
*   **Type Safety:** Baştan sona TypeScript kullanımı ile tip güvenliği.
*   **Performans:** Vite ile optimize edilmiş build süreci ve React 19'un yeni özellikleri.
*   **Modüler Mimari:** Bakımı kolay, genişletilebilir bileşen ve klasör yapısı.

## 🛠 Kullanılan Teknolojiler

Bu proje güncel web teknolojileri kullanılarak inşa edilmiştir:

*   **Core:** [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
*   **Build Tool:** [Vite 7](https://vitejs.dev/)
*   **Routing:** [React Router v7](https://reactrouter.com/)
*   **Veritabanı & Backend:** [Supabase](https://supabase.com/)
*   **Drag & Drop:** [@dnd-kit](https://dndkit.com/) (Core, Sortable, Utilities)
*   **UI & Animasyon:** 
    *   [Framer Motion](https://www.framer.com/motion/) (Animasyonlar)
    *   [Three.js](https://threejs.org/) & [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) (3D Efektler)
*   **CSS:** Modern CSS Variables, CSS Modules

## 📦 Kurulum

Projeyi yerel ortamınızda çalıştırmak için aşağıdaki adımları izleyin:

1.  **Repoyu Klonlayın:**
    ```bash
    git clone https://github.com/kullaniciadi/kanban-app.git
    cd kanban-app
    ```

2.  **Bağımlılıkları Yükleyin:**
    ```bash
    # pnpm kullanıyorsanız (önerilen)
    pnpm install

    # veya npm
    npm install
    ```

3.  **Çevresel Değişkenleri Ayarlayın:**
    Kök dizinde `.env.local` dosyası oluşturun ve Supabase bilgilerinizi ekleyin:
    ```env
    VITE_SUPABASE_URL=your_supabase_project_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Uygulamayı Başlatın:**
    ```bash
    pnpm run dev
    ```
    Uygulama `http://localhost:5173` adresinde çalışacaktır.

## ⌨️ Klavye Kısayolları

Uygulama içinde kullanabileceğiniz bazı temel kısayollar:

| Tuş | İşlem |
|-----|-------|
| `?` | Kısayol menüsünü aç/kapat |
| `N` | Yeni Board oluştur |
| `T` | Temayı değiştir (Koyu/Açık) |
| `Esc` | Modalları veya pencereleri kapat |

## 🤝 Katkıda Bulunma

1.  Bu repoyu fork'layın.
2.  Yeni bir feature branch oluşturun (`git checkout -b feature/AmazingFeature`).
3.  Değişikliklerinizi commit'leyin (`git commit -m 'Add some AmazingFeature'`).
4.  Branch'inizi push'layın (`git push origin feature/AmazingFeature`).
5.  Bir Pull Request oluşturun.

## 📄 Lisans

Bu proje [MIT](LICENSE) lisansı ile lisanslanmıştır.
