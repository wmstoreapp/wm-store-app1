import { useEffect, useMemo, useState } from "react";
import { Image, Linking, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { ProfileMenu } from "@/components/profile-menu";
import { useThemeContext } from "@/lib/theme-provider";
import { discountedPrice, loadProducts, type Product } from "@/lib/catalog";

const WHATSAPP_NUMBER = "201095314107";
const categories = ["الكل", "إكسسوارات", "عناية", "هدايا"];

function ProductCard({ product, onOpen, dark }: { product: Product; onOpen: () => void; dark: boolean }) {
  return (
    <Pressable onPress={onOpen} style={({ pressed }) => [styles.productCard, dark && styles.darkCard, { opacity: pressed ? 0.88 : 1 }]}>
      <View style={[styles.productImageWrap, { backgroundColor: product.accent }]}>
        <Image source={{ uri: product.image }} style={styles.productImage} />
        <View style={styles.imageBadge}><Text style={styles.imageBadgeText}>wm</Text></View>
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productCategory}>{product.category}</Text>
        <Text style={[styles.productName, dark && styles.darkText]} numberOfLines={1}>{product.name}</Text>
        <View style={styles.productBottomRow}>
          <Text style={[styles.productPrice, dark && styles.darkText]}>{discountedPrice(product)}</Text>
          <View style={styles.cardArrow}><Text style={styles.cardArrowText}>↗</Text></View>
        </View>
      </View>
    </Pressable>
  );
}

export default function HomeScreen() {
  const { colorScheme } = useThemeContext();
  const [products, setProducts] = useState<Product[]>([]);
  useEffect(() => { loadProducts().then(setProducts); }, []);
  const dark = colorScheme === "dark";
  const [selectedCategory, setSelectedCategory] = useState("الكل");
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [toast, setToast] = useState("");
  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products.filter((product) => (selectedCategory === "الكل" || product.category === selectedCategory) && (!query || product.name.toLowerCase().includes(query)));
  }, [search, selectedCategory]);
  const orderOnWhatsApp = async (product: Product) => {
    const message = `مرحباً wm، أريد طلب: ${product.name} بسعر ${discountedPrice(product)}`;
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    try { await Linking.openURL(whatsappUrl); } catch { setToast("تعذر فتح واتساب. تأكد من تثبيته على جهازك."); setTimeout(() => setToast(""), 3200); }
  };
  return (
    <ScreenContainer edges={["top", "left", "right"]} containerClassName={dark ? "bg-[#17152A]" : "bg-[#F8F7F2]"}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <View style={styles.brandMark}><Text style={styles.brandText}>wm</Text><View style={styles.brandDot} /></View>
            <ProfileMenu compact />
          </View>
          <Text style={styles.heroTitle}>اختار اللي{`\n`}يعجبك اليوم.</Text>
          <Text style={styles.heroSubtitle}>منتجات لطيفة، أسعار حلوة، وطلبك على واتساب في لحظة.</Text>
          <View style={styles.searchBox}><Text style={styles.searchIcon}>⌕</Text><TextInput value={search} onChangeText={setSearch} placeholder="دور على منتج..." placeholderTextColor="#8C8A94" style={styles.searchInput} textAlign="right" /></View>
        </View>
        <View style={styles.sectionHeader}><Text style={[styles.sectionTitle, dark && styles.darkText]}>مختارات اليوم</Text><Text style={styles.itemCount}>{filteredProducts.length} منتجات</Text></View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesRow}>
          {categories.map((category) => { const active = category === selectedCategory; return <Pressable key={category} onPress={() => setSelectedCategory(category)} style={[styles.categoryChip, dark && styles.darkChip, active && styles.categoryChipActive]}><Text style={[styles.categoryText, dark && styles.darkSecondary, active && styles.categoryTextActive]}>{category}</Text></Pressable>; })}
        </ScrollView>
        <View style={styles.productGrid}>{filteredProducts.map((product) => <ProductCard key={product.id} product={product} dark={dark} onOpen={() => setSelectedProduct(product)} />)}</View>
        {filteredProducts.length === 0 && <View style={styles.emptyState}><Text style={styles.emptyEmoji}>⌁</Text><Text style={styles.emptyTitle}>مفيش نتائج دلوقتي</Text><Text style={styles.emptyText}>جرّب كلمة بحث تانية أو اختار كل المنتجات.</Text></View>}
        <View style={styles.whatsappBanner}><View style={styles.whatsappCircle}><Text style={styles.whatsappIcon}>◌</Text></View><View style={styles.bannerCopy}><Text style={styles.bannerTitle}>جاهز للدفع؟</Text><Text style={styles.bannerText}>اضغط الدفع لإكمال طلبك</Text></View><Text style={styles.bannerArrow}>←</Text></View>
        <Text style={styles.footerNote}>wm · made for your little moments</Text>
      </ScrollView>
      <Modal visible={Boolean(selectedProduct)} animationType="slide" transparent onRequestClose={() => setSelectedProduct(null)}>
        <View style={styles.modalBackdrop}><View style={[styles.modalCard, dark && styles.darkCard]}><Pressable onPress={() => setSelectedProduct(null)} style={styles.closeButton}><Text style={styles.closeButtonText}>×</Text></Pressable>
          {selectedProduct && <><Image source={{ uri: selectedProduct.image }} style={styles.modalImage} /><Text style={styles.modalCategory}>{selectedProduct.category}</Text><Text style={[styles.modalTitle, dark && styles.darkText]}>{selectedProduct.name}</Text><Text style={[styles.modalDescription, dark && styles.darkSecondary]}>{selectedProduct.description}</Text><View style={styles.modalFooter}><Text style={[styles.modalPrice, dark && styles.darkText]}>{discountedPrice(selectedProduct)}</Text><Pressable onPress={() => orderOnWhatsApp(selectedProduct)} style={({ pressed }) => [styles.buyButton, { opacity: pressed ? 0.8 : 1 }]}><Text style={styles.buyButtonText}>الدفع الآن ↗</Text></Pressable></View></>}
        </View></View>
      </Modal>
      {toast ? <View style={styles.toast}><Text style={styles.toastText}>{toast}</Text></View> : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  darkCard: { backgroundColor: "#24213D" }, darkText: { color: "#FFF8E8" }, darkSecondary: { color: "#BDB9CD" }, darkChip: { backgroundColor: "#24213D", borderColor: "#403B60" },
  scrollContent: { paddingBottom: 30 }, header: { backgroundColor: "#1D1A35", borderBottomLeftRadius: 30, borderBottomRightRadius: 30, paddingHorizontal: 22, paddingTop: 15, paddingBottom: 24 }, headerTopRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" }, headerActions: { alignItems: "center", flexDirection: "row", gap: 12 }, brandMark: { alignItems: "center", backgroundColor: "#FFD166", borderRadius: 16, flexDirection: "row", paddingHorizontal: 12, paddingVertical: 8 }, brandText: { color: "#1D1A35", fontSize: 22, fontWeight: "900", letterSpacing: -1 }, brandDot: { backgroundColor: "#F08A75", borderRadius: 4, height: 7, marginLeft: 5, width: 7 }, headerHint: { alignItems: "center", flexDirection: "row", gap: 7 }, headerHintText: { color: "#B9B6C9", fontSize: 11, fontWeight: "600" }, headerHintIcon: { color: "#FFD166", fontSize: 16 }, heroTitle: { color: "#FFFFFF", fontSize: 36, fontWeight: "900", letterSpacing: -1.2, lineHeight: 39, marginTop: 28, textAlign: "right" }, heroSubtitle: { color: "#C9C6D7", fontSize: 13, lineHeight: 21, marginTop: 12, textAlign: "right" }, searchBox: { alignItems: "center", backgroundColor: "#2D2A4B", borderColor: "#454160", borderRadius: 15, borderWidth: 1, flexDirection: "row", marginTop: 21, paddingHorizontal: 13 }, searchIcon: { color: "#FFD166", fontSize: 25, marginRight: 7 }, searchInput: { color: "#FFFFFF", flex: 1, fontSize: 14, height: 48 }, sectionHeader: { alignItems: "baseline", flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 22, paddingTop: 25 }, sectionTitle: { color: "#1D1A35", fontSize: 21, fontWeight: "900" }, itemCount: { color: "#918F9B", fontSize: 12, fontWeight: "600" }, categoriesRow: { gap: 9, paddingHorizontal: 22, paddingTop: 15, paddingBottom: 18 }, categoryChip: { backgroundColor: "#FFFFFF", borderColor: "#E8E6E0", borderRadius: 20, borderWidth: 1, paddingHorizontal: 17, paddingVertical: 9 }, categoryChipActive: { backgroundColor: "#1D1A35", borderColor: "#1D1A35" }, categoryText: { color: "#6E6B76", fontSize: 12, fontWeight: "700" }, categoryTextActive: { color: "#FFD166" }, productGrid: { flexDirection: "row", flexWrap: "wrap", gap: 14, paddingHorizontal: 22 }, productCard: { backgroundColor: "#FFFFFF", borderRadius: 20, overflow: "hidden", width: "47.8%" }, productImageWrap: { height: 156, overflow: "hidden", position: "relative" }, productImage: { height: "100%", width: "100%" }, imageBadge: { backgroundColor: "#1D1A35", borderRadius: 10, left: 10, paddingHorizontal: 7, paddingVertical: 4, position: "absolute", top: 10 }, imageBadgeText: { color: "#FFD166", fontSize: 10, fontWeight: "900" }, productInfo: { padding: 12 }, productCategory: { color: "#F08A75", fontSize: 10, fontWeight: "800", marginBottom: 5 }, productName: { color: "#252239", fontSize: 14, fontWeight: "800" }, productBottomRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginTop: 12 }, productPrice: { color: "#1D1A35", fontSize: 13, fontWeight: "900" }, cardArrow: { alignItems: "center", backgroundColor: "#FFD166", borderRadius: 12, height: 26, justifyContent: "center", width: 26 }, cardArrowText: { color: "#1D1A35", fontSize: 15, fontWeight: "900" }, emptyState: { alignItems: "center", padding: 35 }, emptyEmoji: { color: "#F08A75", fontSize: 32 }, emptyTitle: { color: "#1D1A35", fontSize: 17, fontWeight: "800", marginTop: 8 }, emptyText: { color: "#7D7A85", fontSize: 13, marginTop: 5 }, whatsappBanner: { alignItems: "center", backgroundColor: "#D7F2E3", borderRadius: 21, flexDirection: "row", marginHorizontal: 22, marginTop: 25, padding: 15 }, whatsappCircle: { alignItems: "center", backgroundColor: "#1D1A35", borderRadius: 22, height: 44, justifyContent: "center", width: 44 }, whatsappIcon: { color: "#B8F1CE", fontSize: 26 }, bannerCopy: { flex: 1, marginHorizontal: 12 }, bannerTitle: { color: "#1D1A35", fontSize: 14, fontWeight: "900", textAlign: "right" }, bannerText: { color: "#587164", fontSize: 11, marginTop: 3, textAlign: "right" }, bannerArrow: { color: "#1D1A35", fontSize: 22, fontWeight: "800" }, footerNote: { color: "#AAA7B0", fontSize: 10, letterSpacing: 1, marginTop: 22, textAlign: "center" }, modalBackdrop: { backgroundColor: "rgba(29,26,53,0.62)", flex: 1, justifyContent: "flex-end" }, modalCard: { backgroundColor: "#FFFFFF", borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 22, paddingBottom: 30 }, closeButton: { alignItems: "center", alignSelf: "flex-start", backgroundColor: "#F4F2ED", borderRadius: 17, height: 34, justifyContent: "center", position: "absolute", right: 20, top: 18, width: 34, zIndex: 2 }, closeButtonText: { color: "#1D1A35", fontSize: 25, lineHeight: 27 }, modalImage: { backgroundColor: "#F4E3C3", borderRadius: 20, height: 210, marginBottom: 18, width: "100%" }, modalCategory: { color: "#F08A75", fontSize: 11, fontWeight: "800", textAlign: "right" }, modalTitle: { color: "#1D1A35", fontSize: 24, fontWeight: "900", marginTop: 5, textAlign: "right" }, modalDescription: { color: "#706D79", fontSize: 14, lineHeight: 23, marginTop: 9, textAlign: "right" }, modalFooter: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginTop: 23 }, modalPrice: { color: "#1D1A35", fontSize: 18, fontWeight: "900" }, buyButton: { backgroundColor: "#1D1A35", borderRadius: 15, paddingHorizontal: 18, paddingVertical: 13 }, buyButtonText: { color: "#FFD166", fontSize: 13, fontWeight: "800" }, toast: { backgroundColor: "#1D1A35", borderRadius: 14, bottom: 20, left: 22, paddingHorizontal: 16, paddingVertical: 12, position: "absolute", right: 22 }, toastText: { color: "#FFFFFF", fontSize: 12, textAlign: "center" },
});
