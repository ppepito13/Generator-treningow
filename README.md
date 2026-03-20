# Generator Treningów

Aplikacja mobilna (Android/iOS) oraz webowa służąca do dynamicznego generowania hybrydowych treningów stacyjnych i planów ćwiczeń dla wielu uczestników.  
Stworzona przy użyciu **Next.js**, **TailwindCSS** oraz obudowana natywnie za pomocą **Capacitor**.

## 🛠️ Uruchomienie deweloperskie (Przeglądarka)

```bash
npm run dev
```
Aplikacja będzie dostępna pod adresem [http://localhost:9002](http://localhost:9002).

## 📱 Budowanie aplikacji mobilnej (Android)

Aby zsynchronizować najnowsze zmiany webowe z projektem natywnym:

```bash
npm run cap:sync     # Kompiluje kod Next.js i przenosi go do Android Studio
npm run cap:open     # Otwiera projekt w Android Studio
```

---
*Stworzone z pasją przez Pepito Labs.*
