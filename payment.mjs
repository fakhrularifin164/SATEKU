// Midtrans Snap integration. Secrets are read exclusively from Worker environment.
const CHANNELS=['other_qris','gopay','shopeepay','bca_va','bni_va','bri_va','permata_va','echannel','cimb_va','danamon_va','other_va'];
export const CATALOG=[{id:1,name:'Sate Ayam 10 Tusuk',price:25000},{id:2,name:'Sate Taichan 10 Tusuk',price:28000},{id:3,name:'Sate Kulit 5 Tusuk',price:15000},{id:4,name:'Paket Sate + Nasi + Es Teh',price:32000},{id:5,name:'Sate Usus 5 Tusuk',price:12000},{id:6,name:'Sate Bakso 5 Tusuk',price:15000},{id:7,name:'Sate Sosis 5 Tusuk',price:15000},{id:8,name:'Sate Ceker 5 Tusuk',price:15000},{id:9,name:'Es Teh Manis',price:5000},{id:10,name:'Tengkleng',price:35000},{id:11,name:'Tongseng',price:30000},{id:12,name:'Nasi Goreng',price:20000},{id:13,name:'Air Mineral',price:5000},{id:14,name:'Sop Ayam',price:25000},{id:15,name:'Sop Sapi',price:30000},{id:16,name:'Es Jeruk',price:8000},{id:17,name:'Teh Tawar',price:3000}];
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const active=env=>Boolean(env.MIDTRANS_SERVER_KEY&&env.PAYMENTS_ENABLED==='true');
function mode(env){return env.MIDTRANS_ENV==='production'?'production':'sandbox'}
function origin(env){return mode(env)==='production'?'https://app.midtrans.com':'https://app.sandbox.midtrans.com'}
function api(env){return mode(env)==='production'?'https://api.midtrans.com':'https://api.sandbox.midtrans.com'}
const encoder=new TextEncoder();
async function signingKey(env){return crypto.subtle.importKey('raw',encoder.encode(env.MIDTRANS_SERVER_KEY),{name:'HMAC',hash:'SHA-256'},false,['sign','verify'])}
function encode(bytes){return btoa(String.fromCharCode(...new Uint8Array(bytes))).replaceAll('+','-').replaceAll('/','_').replaceAll('=','')}
function decode(s){return Uint8Array.from(atob(s.replaceAll('-','+').replaceAll('_','/')),c=>c.charCodeAt(0))}
async function receipt(data,env){const payload=encode(encoder.encode(JSON.stringify(data)));return payload+'.'+encode(await crypto.subtle.sign('HMAC',await signingKey(env),encoder.encode(payload)))}
async function verify(token,env){try{const [payload,signature]=token.split('.');if(!payload||!signature||token.length>1500)return null;if(!await crypto.subtle.verify('HMAC',await signingKey(env),decode(signature),encoder.encode(payload)))return null;const d=JSON.parse(new TextDecoder().decode(decode(payload)));return d.exp>Date.now()?d:null}catch{return null}}
function string(v,max){if(typeof v!=='string'||v.length>max)throw Error('Isian tidak valid.');return v.trim()}
export function quote(input){if(!Array.isArray(input.items)||!input.items.length||input.items.length>30)throw Error('Keranjang tidak valid.');if(!['Delivery','Pickup','DineIn'].includes(input.method))throw Error('Metode pemesanan tidak valid.');if(input.method==='DineIn'&&!/^[1-9][0-9]{0,2}$/.test(String(input.table||'')))throw Error('Nomor meja wajib diisi (1–999).');if(input.voucher)throw Error('Voucher demo tidak berlaku untuk pembayaran online. Hapus voucher terlebih dahulu.');let subtotal=0;const items=input.items.map((i,index)=>{const p=CATALOG.find(p=>p.id===i.id);if(!p||!Number.isInteger(i.qty)||i.qty<1||i.qty>50||![1,2].includes(i.portion)||![0,4000,5000].includes(i.extra))throw Error('Produk atau jumlah tidak valid.');if(!Number.isInteger(Number(i.spice))||+i.spice<0||+i.spice>5)throw Error('Level pedas tidak valid.');const price=p.price*i.portion+i.extra;subtotal+=price*i.qty;return{id:String(p.id)+'-'+index,price,quantity:i.qty,name:(p.name+' · '+i.portion+' porsi · L'+i.spice).slice(0,50)}});const shipping=input.method==='Delivery'?10000:0;if(shipping)items.push({id:'delivery',price:shipping,quantity:1,name:'Ongkir'});const total=subtotal+shipping;if(total>5000000)throw Error('Maksimum transaksi Rp5.000.000.');return{items,subtotal,shipping,total}}
async function gateway(url,env,options={}){const r=await fetch(url,{...options,headers:{Accept:'application/json','Content-Type':'application/json',Authorization:'Basic '+btoa(env.MIDTRANS_SERVER_KEY+':')},signal:AbortSignal.timeout(18000)});let data;try{data=await r.json()}catch{throw Error('Gateway tidak memberikan respons valid. Coba cek status sebelum mengulang.')}return{ok:r.ok,data}}
export async function paymentAPI(request,env){const url=new URL(request.url);if(url.pathname==='/api/payments/config'&&request.method==='GET')return json({enabled:active(env),provider:'Midtrans',manualQris:{enabled:true,image:'/assets/QRIS-Pembayaran.jpg',pdf:'/assets/QRIS-Pembayaran.pdf',merchant:'MUHAMAD FAKHRUL ARIFIN',verification:'manual'},mode:mode(env),channels:['QRIS','Virtual Account Bank'],message:active(env)?(mode(env)==='sandbox'?'Sandbox: uang uji, bukan pembayaran nyata.':'Pembayaran online aktif.'):'Akun merchant dan Server Key belum dikonfigurasi.'});if(!url.pathname.startsWith('/api/payments/'))return null;
if(!active(env))return json({error:'Pembayaran online belum diaktifkan. Akun Midtrans perlu dikonfigurasi.'},503);
if(request.method!=='POST')return json({error:'Metode tidak didukung.'},405);
if(request.headers.get('Origin')!==url.origin)return json({error:'Origin ditolak.'},403);
if(!request.headers.get('Content-Type')?.includes('application/json'))return json({error:'JSON diperlukan.'},415);
try{const raw=await request.text();if(raw.length>18000)return json({error:'Permintaan terlalu besar.'},413);const input=JSON.parse(raw);
if(url.pathname==='/api/payments/create'){
 const owner=request.headers.get('oai-authenticated-user-id');if(!owner)return json({error:'Masuk dengan akun ChatGPT sebelum membuat pembayaran.'},401);
 const name=string(input.customer?.name,80),phone=string(input.customer?.phone,20),address=string(input.customer?.address||'',500);if(name.length<2||!/^\+?[0-9 ()-]{9,20}$/.test(phone)||(input.method==='Delivery'&&address.length<10))throw Error('Nama, WhatsApp, atau alamat belum valid.');
 const q=quote(input);if(!/^[0-9a-f-]{36}$/.test(input.requestId||''))throw Error('Referensi permintaan tidak valid.');
 const orderId='SK-'+input.requestId.replaceAll('-','').toUpperCase();
 const payload={transaction_details:{order_id:orderId,gross_amount:q.total},item_details:q.items,customer_details:{first_name:name,phone,shipping_address:{first_name:name,phone,address:address.slice(0,200),country_code:'IDN'}},enabled_payments:CHANNELS,custom_field1:input.method+(input.method==='DineIn'?' Meja '+input.table:''),callbacks:{finish:url.origin+'/index.html?payment_return=1'},expiry:{unit:'hours',duration:2}};
 const {ok,data}=await gateway(origin(env)+'/snap/v1/transactions',env,{method:'POST',body:JSON.stringify(payload)});if(!ok||!data.token||!data.redirect_url)return json({error:'Sesi pembayaran belum berhasil dibuat. Cek dashboard Midtrans sebelum membuat ulang.'},502);
 const redirect=new URL(data.redirect_url);if(redirect.origin!==origin(env))return json({error:'Alamat pembayaran tidak valid.'},502);
 const reference=await receipt({id:orderId,total:q.total,owner,exp:Date.now()+30*86400000},env);
 return json({orderId,reference,total:q.total,redirectUrl:data.redirect_url,mode:mode(env),status:'pending'});
}
if(url.pathname==='/api/payments/status'){
 const ref=await verify(String(input.reference||''),env);if(!ref)return json({error:'Referensi pembayaran tidak valid atau kedaluwarsa.'},403);
 if(ref.owner!==request.headers.get('oai-authenticated-user-id'))return json({error:'Pembayaran ini milik akun lain.'},403);
 const {ok,data}=await gateway(api(env)+'/v2/'+encodeURIComponent(ref.id)+'/status',env);
 if(data.status_code==='404')return json({orderId:ref.id,status:'pending',paid:false,total:ref.total,mode:mode(env)});
 if(!ok||data.order_id!==ref.id||Number(data.gross_amount)!==ref.total)return json({error:'Status pembayaran belum dapat diverifikasi.'},502);
 const paid=(data.transaction_status==='settlement'||(data.transaction_status==='capture'&&data.fraud_status==='accept'))&&(!data.fraud_status||data.fraud_status==='accept');
 return json({orderId:ref.id,status:data.transaction_status,paid,total:ref.total,paymentType:data.payment_type,mode:mode(env)});
}
return json({error:'Endpoint tidak ditemukan.'},404);
}catch(error){return json({error:error instanceof SyntaxError?'JSON tidak valid.':error.name==='TimeoutError'?'Gateway belum merespons. Cek status sebelum mengulang.':error.message||'Permintaan gagal.'},400)}}
