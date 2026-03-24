# Skrypt automatyzujący zmianę wersji w projekcie Generator Treningów SW
# Czyści i synchronizuje pliki Webowe oraz Pakiety Natywne Androida.

$versionFilePath = 'app-version.json'

if (-not (Test-Path $versionFilePath)) {
    Write-Error "Nie znaleziono pliku $versionFilePath! Upewnij sie, ze jest on w glownym folderze."
    exit
}

# Czytanie pliku centralnego z wersją
$json = Get-Content $versionFilePath -Raw | ConvertFrom-Json
$versionName = $json.versionName
$versionCode = $json.versionCode

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "Aktualizowanie Generatora do wersji: $versionName" -ForegroundColor Cyan
Write-Host "Google Play Wewnetrzny kod: $versionCode" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# 1. Zmiana w package.json (Dla weba / Firebase)
$packageJsonPath = 'package.json'
if (Test-Path $packageJsonPath) {
    (Get-Content $packageJsonPath) -replace '"version": ".*"', ("`"version`": `"$versionName`"") | Set-Content $packageJsonPath
    Write-Host "[OK] Zaktualizowano package.json (Web)" -ForegroundColor Green
} else {
    Write-Host "[BLAD] Nie znaleziono package.json" -ForegroundColor Red
}

# 2. Zmiana w android/app/build.gradle (Dla kodu natywnego APK/AAB)
$gradlePath = 'android\app\build.gradle'
if (Test-Path $gradlePath) {
    $gradleContent = Get-Content $gradlePath
    $gradleContent = $gradleContent -replace 'versionCode \d+', "versionCode $versionCode"
    $gradleContent = $gradleContent -replace 'versionName ".*"', "versionName `"$versionName`""
    $gradleContent | Set-Content $gradlePath
    Write-Host "[OK] Zaktualizowano android/app/build.gradle (Android)" -ForegroundColor Green
} else {
    Write-Host "[BLAD] Nie znaleziono android\app\build.gradle" -ForegroundColor Red
}

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "Sukces! Wszystkie sciezki zaktualizowane." -ForegroundColor Green
Write-Host "Uruchom 'npm run cap:sync' aby przebudowac projekt i podpiac narzedzia." -ForegroundColor Yellow
