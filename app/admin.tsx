import { useEffect, useState } from "react";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { createProduct, deactivateProduct, DEFAULT_PRODUCTS, loadProducts, saveProducts, type Product, updateProduct, uploadProductImage } from "@/lib/catalog";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
const blank: Product = { id: "", name: "", category: "هدايا", price: "0 ج.م", description: "", image: "", accent: "#FFE7B3", discount: 0 };

export default function AdminScreen() {
  const router = useRouter();
  const [unlocked, setUnlocked] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [editing, setEditing] = useState<Product | null>(null);
  const [error, setError] = useState("");

  useEffect(() => { loadProducts().then(setProducts); }, []);
  const unlock = async () => {
    if (!supabase) { setError("لم يتم إعداد اتصال Supabase"); return; }
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (signInError) { setError("بيانات دخول المدير غير صحيحة"); return; }
    const { data: admin, error: roleError } = await supabase.rpc("is_admin");
    if (roleError || !admin) { await supabase.auth.signOut(); setError("هذا الحساب ليس ضمن مديري المتجر"); return; }
    setUnlocked(true); setError("");
  };
  const save = async () => {
    if (!editing?.name.trim() || !editing.price.trim()) return;
    try {
      if (!isSupabaseConfigured) {
        const next = products.some((p) => p.id === editing.id) ? products.map((p) => p.id === editing.id ? editing : p) : [...products, { ...editing, id: Date.now().toString() }];
        setProducts(next); await saveProducts(next); setEditing(null); return;
      }
      const existing = products.some((p) => p.id === editing.id);
      const localImage = /^(file|blob|data):/.test(editing.image);
      let saved = existing ? await updateProduct(localImage ? { ...editing, image: "" } : editing) : await createProduct(localImage ? { ...editing, image: "" } : editing);
      if (localImage) saved = await updateProduct({ ...saved, image: await uploadProductImage(editing.image, saved.id) });
      const next = existing ? products.map((p) => p.id === editing.id ? saved : p) : [saved, ...products];
      setProducts(next); await saveProducts(next); setEditing(null);
    } catch (error) { Alert.alert("تعذر الحفظ", "تأكد من تنفيذ سياسات Supabase وصلاحيات جدول products وStorage."); console.warn("[wm admin] save failed", error); }
  };
  const remove = (product: Product) => Alert.alert("إخفاء المنتج", `هل تريد إخفاء ${product.name}؟`, [{ text: "إلغاء", style: "cancel" }, { text: "إخفاء", style: "destructive", onPress: async () => { try { if (isSupabaseConfigured) await deactivateProduct(product.id); const next = products.filter((p) => p.id !== product.id); setProducts(next); await saveProducts(next); } catch (error) { Alert.alert("تعذر الإخفاء", "تأكد من صلاحيات التعديل في Supabase."); console.warn("[wm admin] deactivate failed", error); } } }]);
  const chooseImage = async () => { const permission = await ImagePicker.requestMediaLibraryPermissionsAsync(); if (!permission.granted || !editing) return; const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.85 }); if (!result.canceled && result.assets[0]?.uri) setEditing({ ...editing, image: result.assets[0].uri }); };

  if (!unlocked) return <ScreenContainer edges={["top", "left", "right"]} containerClassName="bg-[#17152A]"><View style={styles.lockWrap}><Text style={styles.lockLogo}>wm</Text><Text style={styles.lockTitle}>للإدارة فقط</Text><Text style={styles.lockHint}>سجّل بحساب مدير Supabase للوصول إلى المنتجات.</Text><TextInput value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="البريد الإلكتروني للمدير" placeholderTextColor="#9D98B4" style={styles.password} textAlign="right" /><TextInput value={password} onChangeText={setPassword} secureTextEntry placeholder="كلمة المرور" placeholderTextColor="#9D98B4" style={styles.password} textAlign="right" /><Pressable onPress={unlock} style={styles.primary}><Text style={styles.primaryText}>دخول لوحة الإدارة</Text></Pressable>{error ? <Text style={styles.error}>{error}</Text> : null}<Pressable onPress={() => router.back()}><Text style={styles.back}>العودة للمتجر</Text></Pressable></View></ScreenContainer>;

  return <ScreenContainer edges={["top", "left", "right"]} containerClassName="bg-[#F8F7F2]"><ScrollView contentContainerStyle={styles.content}><View style={styles.adminHeader}><View><Text style={styles.kicker}>wm CONTROL</Text><Text style={styles.title}>إدارة المنتجات</Text></View><Pressable onPress={async () => { await supabase?.auth.signOut(); setUnlocked(false); setEmail(""); setPassword(""); }}><Text style={styles.lockout}>قفل</Text></Pressable></View><Text style={styles.subtitle}>عدّل العناوين والأسعار والصور والتخفيضات بسهولة.</Text><Pressable onPress={() => setEditing({ ...blank, id: Date.now().toString() })} style={styles.add}><Text style={styles.addText}>＋ إضافة منتج جديد</Text></Pressable>{editing ? <Editor product={editing} setProduct={setEditing} onImage={chooseImage} onSave={save} onCancel={() => setEditing(null)} /> : null}<Text style={styles.count}>{products.length} منتجات</Text>{products.map((product) => <View key={product.id} style={styles.productRow}><Image source={{ uri: product.image }} style={styles.thumb} /><View style={styles.rowCopy}><Text style={styles.rowName}>{product.name}</Text><Text style={styles.rowMeta}>{product.price}{product.discount ? ` · خصم ${product.discount}%` : ""}</Text></View><Pressable onPress={() => setEditing(product)}><Text style={styles.edit}>تعديل</Text></Pressable><Pressable onPress={() => remove(product)}><Text style={styles.delete}>إخفاء</Text></Pressable></View>)}</ScrollView></ScreenContainer>;
}

function Editor({ product, setProduct, onImage, onSave, onCancel }: { product: Product; setProduct: (p: Product) => void; onImage: () => void; onSave: () => void; onCancel: () => void }) {
  const field = (key: keyof Product, placeholder: string) => <TextInput value={String(product[key])} onChangeText={(value) => setProduct({ ...product, [key]: value })} placeholder={placeholder} placeholderTextColor="#9D98A4" style={styles.field} textAlign="right" />;
  return <View style={styles.editor}><Text style={styles.editorTitle}>{product.id ? "تعديل المنتج" : "منتج جديد"}</Text>{field("name", "اسم المنتج")}{field("price", "السعر مثل 249 ج.م")}{field("category", "الفئة")}{field("description", "وصف مختصر")}{field("discount", "نسبة التخفيض مثل 20") }<View style={styles.editorActions}><Pressable onPress={onImage} style={styles.imageButton}>{product.image ? <Image source={{ uri: product.image }} style={styles.editorImage} /> : <Text style={styles.imageButtonText}>إضافة صورة مربعة</Text>}</Pressable><View style={styles.buttons}><Pressable onPress={onSave} style={styles.save}><Text style={styles.saveText}>حفظ</Text></Pressable><Pressable onPress={onCancel}><Text style={styles.cancel}>إلغاء</Text></Pressable></View></View></View>;
}

const styles = StyleSheet.create({ lockWrap: { flex: 1, justifyContent: "center", padding: 24 }, lockLogo: { alignSelf: "center", backgroundColor: "#FFD166", borderRadius: 22, color: "#1D1A35", fontSize: 42, fontWeight: "900", paddingHorizontal: 24, paddingVertical: 11 }, lockTitle: { color: "#FFF8E8", fontSize: 28, fontWeight: "900", marginTop: 28, textAlign: "center" }, lockHint: { color: "#BDB9CD", fontSize: 13, marginTop: 10, textAlign: "center" }, password: { backgroundColor: "#24213D", borderColor: "#403B60", borderRadius: 14, borderWidth: 1, color: "#FFF8E8", height: 52, marginTop: 26, paddingHorizontal: 15 }, primary: { alignItems: "center", backgroundColor: "#F08A75", borderRadius: 14, marginTop: 12, paddingVertical: 15 }, primaryText: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" }, error: { color: "#FF9B83", marginTop: 12, textAlign: "center" }, back: { color: "#FFD166", fontSize: 12, marginTop: 25, textAlign: "center" }, content: { padding: 22, paddingBottom: 40 }, adminHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" }, kicker: { color: "#F08A75", fontSize: 10, fontWeight: "900" }, title: { color: "#1D1A35", fontSize: 28, fontWeight: "900", marginTop: 5 }, lockout: { color: "#C95D51", fontSize: 12, fontWeight: "900" }, subtitle: { color: "#777482", fontSize: 12, marginTop: 9, textAlign: "right" }, add: { alignItems: "center", backgroundColor: "#1D1A35", borderRadius: 15, marginTop: 22, paddingVertical: 14 }, addText: { color: "#FFD166", fontSize: 13, fontWeight: "900" }, count: { color: "#898591", fontSize: 12, fontWeight: "800", marginTop: 24, textAlign: "right" }, productRow: { alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 16, flexDirection: "row", marginTop: 10, padding: 10 }, thumb: { backgroundColor: "#FFE7B3", borderRadius: 10, height: 52, width: 52 }, rowCopy: { flex: 1, marginHorizontal: 10 }, rowName: { color: "#252239", fontSize: 12, fontWeight: "900", textAlign: "right" }, rowMeta: { color: "#F08A75", fontSize: 11, marginTop: 4, textAlign: "right" }, edit: { color: "#1D1A35", fontSize: 10, fontWeight: "800", marginHorizontal: 7 }, delete: { color: "#C95D51", fontSize: 10, fontWeight: "800" }, editor: { backgroundColor: "#FFFFFF", borderRadius: 18, marginTop: 16, padding: 14 }, editorTitle: { color: "#1D1A35", fontSize: 16, fontWeight: "900", marginBottom: 8, textAlign: "right" }, field: { backgroundColor: "#F8F7F2", borderColor: "#E8E3D8", borderRadius: 11, borderWidth: 1, color: "#1D1A35", height: 44, marginTop: 8, paddingHorizontal: 12 }, editorActions: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginTop: 12 }, imageButton: { alignItems: "center", backgroundColor: "#E7DEFF", borderRadius: 12, height: 70, justifyContent: "center", overflow: "hidden", width: 70 }, editorImage: { height: "100%", width: "100%" }, imageButtonText: { color: "#1D1A35", fontSize: 9, fontWeight: "800", textAlign: "center" }, buttons: { alignItems: "center", flexDirection: "row", gap: 16 }, save: { backgroundColor: "#F08A75", borderRadius: 11, paddingHorizontal: 19, paddingVertical: 11 }, saveText: { color: "#FFFFFF", fontWeight: "900" }, cancel: { color: "#777482", fontSize: 12, fontWeight: "800" },
});
