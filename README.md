# Stok Takip Sistemi

## Proje Hakkında

Stok Takip Sistemi, REST mimarisine dayalı olarak Spring Framework ile geliştirilmiş bir Web API uygulamasıdır. Veritabanı olarak PostgreSQL kullanılmaktadır.

Uygulama, işletmelerin ürün stoklarını, satışlarını, ürün taleplerini ve kâr hesaplarını takip edebilmesini sağlar.

Proje dört ana modülden oluşmaktadır:

1. **Ürün Yönetimi**
   - Ürün ekleme
   - Ürünleri listeleme
   - Ürün bilgilerini güncelleme
   - Ürün silme

2. **Satış İşlemleri**
   - Ürün satışı gerçekleştirme
   - Satış öncesinde stok kontrolü yapma
   - Satış işlemlerini takip etme

3. **Ürün Talepleri**
   - Stokta bulunmayan ürünler için talepleri kaydetme
   - Ürün taleplerini takip etme

4. **Muhasebe**
   - Satış bilgilerini görüntüleme
   - Kâr hesaplarını takip etme

## Kullanılan Teknolojiler

Projede kullanılan temel teknolojiler ve sürümleri aşağıda belirtilmiştir.

| Teknoloji | Sürüm |
|---|---|
| Java | 21.0.7 LTS |
| Apache Maven | 3.8.7 |
| PostgreSQL | 16.15 |
| Spring Framework / Spring Boot | Projede tanımlı sürüm |

> Not: Spring Framework ve Spring Boot sürüm bilgilerini projenin `pom.xml` dosyasındaki bağımlılık ve sürüm tanımlarına göre doğrulayabilirsiniz.

## Kurulum

Uygulamayı çalıştırmadan önce aşağıdaki yazılımların kurulu olması gerekir:

- Java Development Kit (JDK)
- Apache Maven
- PostgreSQL

### 1. Java, Maven ve PostgreSQL Kurulumu

Sisteminizde Java, Maven ve PostgreSQL servislerinin kurulu ve kullanılabilir olduğundan emin olun.

Kurulumları doğrulamak için terminalde aşağıdaki komutları çalıştırın.

**Java sürümünü kontrol etme:**

```bash
java -version
```

**Maven sürümünü kontrol etme:**

```bash
mvn -version
```

**PostgreSQL istemci sürümünü kontrol etme:**

```bash
psql --version
```

Projede kullanılan sürümler:

- Java: `21.0.7`
- Apache Maven: `3.8.7`
- PostgreSQL: `16.15`

### 2. PostgreSQL Veritabanını Oluşturma

Öncelikle PostgreSQL yönetici hesabıyla veritabanı sunucusuna bağlanın.

```bash
sudo -u postgres psql
```

Bağlantı başarılı olduğunda PostgreSQL komut satırı açılacaktır.

#### 2.1. Uygulama Kullanıcısını Oluşturma

Uygulama için PostgreSQL üzerinde ayrı bir kullanıcı oluşturun.

```sql
CREATE ROLE stock_app WITH LOGIN PASSWORD 'BURAYA_GUCLU_BIR_SIFRE_YAZIN';
```

> Güvenlik açısından örnekteki parola yerine kendinize ait güçlü bir parola kullanın.

#### 2.2. Veritabanını Oluşturma

Uygulamanın kullanacağı veritabanını oluşturun.

```sql
CREATE DATABASE stock_db OWNER stock_app;
```

#### 2.3. Veritabanını Kontrol Etme

Veritabanlarının listesini görüntülemek için aşağıdaki komutu çalıştırın.

```sql
\l
```

Listede `stock_db` veritabanını görmelisiniz.

PostgreSQL komut satırından çıkmak için:

```sql
\q
```

#### 2.4. Veritabanı Bağlantısını Test Etme

Terminalde aşağıdaki komutu çalıştırın.

```bash
psql -h localhost -U stock_app -d stock_db
```

Parola istendiğinde oluşturduğunuz kullanıcı parolasını girin.

Bağlantı başarılı olduğunda `stock_db` veritabanına bağlanmış olursunuz.

PostgreSQL komut satırından çıkmak için:

```sql
\q
```

### 3. Veritabanı Bağlantı Ayarlarını Yapılandırma

Uygulamanın PostgreSQL veritabanına bağlanabilmesi için bağlantı ayarlarının yapılandırılması gerekir.

Spring Boot projelerinde bu ayarlar genellikle `application.properties` veya `application.yml` dosyasında bulunur.

Örneğin, `application.properties` dosyası aşağıdaki gibi yapılandırılabilir:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/stock_db
spring.datasource.username=stock_app
spring.datasource.password=${DB_PASSWORD}
```

Bu örnekte `${DB_PASSWORD}`, veritabanı parolasının bir ortam değişkeninden alınmasını sağlar.

Linux terminalinde uygulamayı çalıştırmadan önce parolayı tanımlamak için:

```bash
export DB_PASSWORD='BURAYA_GUCLU_BIR_SIFRE_YAZIN'
```

**Önemli:** Yukarıdaki ayarları uygulamadan önce mevcut `application.properties` veya `application.yml` dosyanızı kontrol edin. Projenizde zaten tanımlanmış ayarları gereksiz yere değiştirmeyin.

## Uygulamayı Çalıştırma

Uygulamayı çalıştırmak için önce Spring Boot tabanlı backend servisini, ardından frontend arayüzünü başlatın.

### 1. Backend Uygulamasını Başlatma

`pom.xml` dosyasının bulunduğu proje dizininde bir terminal açın.

Uygulamayı Maven üzerinden başlatmak için:

```bash
mvn spring-boot:run
```

Alternatif olarak, Eclipse veya başka bir Java IDE'si kullanıyorsanız `BackEndApplication.java` dosyasını Java uygulaması olarak çalıştırabilirsiniz.

Backend başarıyla başlatıldığında API varsayılan yapılandırmada aşağıdaki adres üzerinden erişilebilir olur:

```text
http://localhost:8080
```

> Uygulamanın farklı bir portta çalışacak şekilde yapılandırılmadığından emin olun.

### 2. Frontend Uygulamasını Başlatma

`index.html` dosyasını frontend arayüzünü çalıştırmak için kullanabilirsiniz.

**Yöntem 1: Visual Studio Code Live Server**

1. Projeyi Visual Studio Code ile açın.
2. `index.html` dosyasını bulun.
3. Dosyaya sağ tıklayın.
4. **Open with Live Server** seçeneğini kullanın.

**Yöntem 2: Python HTTP Sunucusu**

`index.html` dosyasının bulunduğu dizinde terminal açın ve aşağıdaki komutu çalıştırın:

```bash
python3 -m http.server 5500
```

Ardından tarayıcınızda aşağıdaki adresi açın:

```text
http://localhost:5500
```

Frontend ve backend servislerinin ayrı adreslerde çalışması normaldir. Frontend'in API isteklerini `http://localhost:8080` adresine gönderecek şekilde yapılandırılmış olması gerekir.

## API Testleri

Backend servisinin HTTP isteklerine yanıt verdiğini ve temel ürün işlemlerinin çalıştığını doğrulamak için aşağıdaki testleri uygulayabilirsiniz.

Testleri gerçekleştirmeden önce backend uygulamasının çalıştığından emin olun.

### 1. API Sağlık Kontrolü

API'nin çalışıp çalışmadığını kontrol etmek için terminalde şu komutu çalıştırın:

```bash
curl -i http://localhost:8080/api/health
```

Başarılı bir istekte aşağıdakine benzer bir yanıt beklenir:

```http
HTTP/1.1 200
Content-Type: application/json
```

Yanıt gövdesi:

```json
{
  "message": "Stok Takip API çalışıyor.",
  "status": "OK"
}
```

HTTP durum kodunun `200 OK` olması, sağlık kontrolü isteğinin başarılı olduğunu gösterir.

### 2. Ürün Ekleme

Yeni bir ürün oluşturmak için aşağıdaki POST isteğini gönderin.

```bash
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
```

İstek başarılı olduğunda API, oluşturulan ürüne ilişkin bir yanıt döndürmelidir.

Dönen yanıt içerisindeki ürün kimliğini (`id`) not edin. Sonraki örneklerde `1` yerine bu kimliği kullanabilirsiniz.

### 3. Ürünleri Listeleme

Veritabanında kayıtlı ürünleri listelemek için aşağıdaki GET isteğini gönderin.

```bash
curl -i http://localhost:8080/api/products
```

Başarılı yanıt, API'nin döndürdüğü ürün listesini içermelidir.

### 4. Ürün Güncelleme

Mevcut bir ürünün bilgilerini güncellemek için aşağıdaki PUT isteğini gönderin.

Bu örnekte `1`, güncellenecek ürünün kimliğidir.

```bash
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
```

İstek başarılı olduğunda ürün bilgileri güncellenmelidir.

### 5. Ürün Silme

Bir ürünü silmek için aşağıdaki DELETE isteğini gönderin.

```bash
curl -i -X DELETE http://localhost:8080/api/products/1
```

Buradaki `1`, silinecek ürünün kimliğidir.

İstek başarılı olduğunda ürün silinmelidir.

> **Not:** HTTP durum kodları ve yanıt gövdeleri uygulamanın controller ve servis yapılandırmasına göre değişebilir. Test sonuçlarını değerlendirirken projenin gerçek API davranışını esas alın.

## Sorun Giderme

### PostgreSQL Bağlantı Hatası

Veritabanına bağlanırken hata alırsanız aşağıdaki noktaları kontrol edin:

- PostgreSQL servisinin çalıştığından emin olun.
- `stock_db` veritabanının oluşturulduğunu doğrulayın.
- `stock_app` kullanıcısının mevcut olduğunu kontrol edin.
- Veritabanı bağlantı adresinin ve portunun doğru olduğunu doğrulayın.
- Kullanıcı adı ve parolanın uygulama yapılandırmasıyla eşleştiğinden emin olun.

### Maven Derleme veya Başlatma Hatası

Uygulama başlatılamıyorsa proje dizininde aşağıdaki komutu çalıştırın:

```bash
mvn clean package
```

Komutun hata vermesi durumunda terminal çıktısını inceleyerek eksik bağımlılıkları, derleme hatalarını ve yapılandırma sorunlarını belirleyin.

### API İstekleri Başarısız Oluyor

API istekleri başarısız olduğunda:

1. Backend uygulamasının çalıştığını doğrulayın.
2. API adresinin ve portunun doğru olduğundan emin olun.
3. İstek gövdesinin geçerli JSON biçiminde olduğunu kontrol edin.
4. HTTP durum kodunu ve backend terminalindeki hata mesajlarını inceleyin.
5. Frontend üzerinden yapılan isteklerde CORS yapılandırmasını kontrol edin.
