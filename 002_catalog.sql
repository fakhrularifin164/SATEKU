-- Initial catalog; can be run again without replacing merchant edits.
insert into public.sateku_products(id,name,price,category,description,image,badge) values
(1,'Sate Ayam 10 Tusuk',25000,'Sate Ayam','Bumbu kacang khas, daging ayam lembut.','/assets/hero.webp','BEST SELLER'),
(2,'Sate Taichan 10 Tusuk',28000,'Sate Taichan','Gurih, segar, sambal yang bikin melek.','/assets/satay.jpg','FAVORIT'),
(3,'Sate Kulit 5 Tusuk',15000,'Sate Kulit','Garing di luar, juicy di setiap gigitan.','/assets/hero.webp','BEST SELLER'),
(4,'Paket Sate + Nasi + Es Teh',32000,'Paket Hemat','Paket lengkap untuk lapar yang serius.','/assets/satay.jpg','HEMAT'),
(5,'Sate Usus 5 Tusuk',12000,'Sate Usus','Bumbu meresap, rasa khas angkringan.','/assets/satay.jpg',''),
(6,'Sate Bakso 5 Tusuk',15000,'Sate Bakso','Bakso bakar dengan kecap manis gurih.','/assets/hero.webp','NEW'),
(7,'Sate Sosis 5 Tusuk',15000,'Sate Sosis','Sosis bakar favorit semua suasana.','/assets/satay.jpg',''),
(8,'Sate Ceker 5 Tusuk',15000,'Sate Ceker','Ceker empuk dengan bumbu bakar.','/assets/hero.webp','NEW'),
(9,'Es Teh Manis',5000,'Minuman','Teh segar, manisnya pas.','/assets/tea.jpg',''),
(10,'Tengkleng',35000,'Menu Berkuah','Kuah rempah hangat dengan rasa gurih khas.','/assets/soup.jpg','NEW'),
(11,'Tongseng',30000,'Menu Berkuah','Masakan berkuah dengan bumbu rempah dan sayuran.','/assets/soup.jpg','NEW'),
(12,'Nasi Goreng',20000,'Nasi Goreng','Nasi goreng berbumbu gurih untuk teman nyate.','/assets/fried-rice.jpg','NEW'),
(13,'Air Mineral',5000,'Minuman','Air mineral untuk menyegarkan waktu makan.','/assets/water.jpg',''),
(14,'Sop Ayam',25000,'Menu Berkuah','Sop ayam hangat dengan kuah ringan dan sayuran.','/assets/soup.jpg','NEW'),
(15,'Sop Sapi',30000,'Menu Berkuah','Sop sapi berkuah gurih dengan sayuran.','/assets/soup.jpg','NEW'),
(16,'Es Jeruk',8000,'Minuman','Minuman jeruk segar dengan es.','/assets/orange.jpg','NEW'),
(17,'Teh Tawar',3000,'Minuman','Teh tanpa tambahan gula, teman makan yang pas.','/assets/tea.jpg','')
on conflict(id) do nothing;
select setval(pg_get_serial_sequence('public.sateku_products','id'),(select max(id) from public.sateku_products));
