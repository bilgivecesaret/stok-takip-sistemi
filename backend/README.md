#STOK TAKİP SİSTEMİ
Stok Takip Web Api, Rest mimarisine dayalı Spring Framework ile oluşturulmuştur. Veritabanı olarak PostgreSQL kullanılmıştır. Bu proje, 4 modülden oluşmaktadır. Bu modüller sırasıyla: Ürün Yönetimi(Ürün ekleme, listeleme, güncelleme, silme), Satış İşlemleri(Ürün satışı ve stok kontrolü), Ürün Talepleri(Stokta olmayan ürünlerin taleplerini takip etme) ve Muhasabe(Satışları ve kâr hesaplarını görüntüleme) 

###KURULUM
1-Java, Maven ve PostgreSQL servislerin kurun. Projede "java version "21.0.7" 2025-04-15 LTS", "Apache Maven 3.8.7", "psql (PostgreSQL) 16.15" versiyonları kullanılmıştır.

2-PostgreSQL veritabanını oluşturun. Terminalde şu komutu çalıştırın:"sudo -u postgres psql". "CREATE ROLE stock_app WITH LOGIN PASSWORD 'stokTakipSistemiIcinGucluBirSifre123!';" ile uygulama kullanıcısını oluşturun. "CREATE DATABASE stock_db OWNER stock_app;" ile veritabanını oluşturun. "\l" komutu ile listede "stock_db" veritabanını görmelisiniz. "psql -h localhost -U stock_app -d stock_db" komutu ile PostgreSQL bağlantısını test edin. Başarılı bağlantıda "stock_db=>" istemini görmelisiniz.


###UYGULAMAYI ÇALIŞTIRMA
1-"pom.xml" dosyasının bulunduğu dizin içerisinde terminal açıp "mvn spring-boot:run" komutunu çalıştırın. İkinci bir yöntem ise "BackEndApplication.java" dosyasını "Run Java" komutu ile çalıştırın.

2-"index.html" dosyasını "Open with Live Server" ile açın. İkinci bir yöntem ise "index.html" dosyasının bulunduğu dizin içerinde terminal açıp "python3 -m http.server 5500" komutu ile çalıştırın.


###API KONTROL: Uygulamanın HTTP isteklerine cevap verebildiğini doğrulayın.
1-Terminalden "curl -i http://localhost:8080/api/health" komutunu çalıştırın. Başarılı olduğunda aşağıdakine benzer bir cevap alacaksınız:
HTTP/1.1 200 
Content-Type: application/json

{"message":"Stok Takip API çalışıyor.","status":"OK"}

2-Ürün kaydetmek için terminalden verilen komutu kullanın.

curl -i -X POST http://localhost:8080/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "category": "Elektronik",
    "name": "Kablosuz Fare",
    "stockQuantity": 25,
    "purchasePrice": 200.00,
    "salePrice": 300.00,
    "vatRate": 20.00
  }'

3-Veritabanında olan ürünleri terminale getirmek için verilen komutu kullanın.

curl -i http://localhost:8080/api/products

4-Ürün güncelleme için verilen komutu kullanın.

curl -i -X PUT http://localhost:8080/api/products/1 \
  -H "Content-Type: application/json" \
  -d '{
    "category": "Elektronik",
    "name": "Kablosuz Fare",
    "stockQuantity": 30,
    "purchasePrice": 200.00,
    "salePrice": 320.00,
    "vatRate": 20.00
  }'

5-Ürün silmek için verilen komutu kullanın.

curl -i -X DELETE http://localhost:8080/api/products/1