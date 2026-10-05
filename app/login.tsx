import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { startOAuthLogin } from "@/constants/oauth";

export default function LoginScreen() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const openAvailableLogin = async () => {
    setLoading(true);
    setMessage("");
    try {
      await startOAuthLogin();
    } catch {
      setMessage("تسجيل الدخول المتاح غير مهيأ في هذه المعاينة بعد.");
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.backgroundShape} />
      <View style={styles.container}>
        <View style={styles.brandMark}><Text style={styles.brandText}>wm</Text><View style={styles.brandDot} /></View>
        <Text style={styles.eyebrow}>أهلاً بك في عالم wm</Text>
        <Text style={styles.title}>خلّينا نعرفك{`\n`}أكثر.</Text>
        <Text style={styles.subtitle}>سجّل دخولك واحفظ اختياراتك، وتابع طلباتك بسهولة.</Text>

        <View style={styles.loginCard}>
          <Text style={styles.cardTitle}>تسجيل الدخول</Text>
          <Text style={styles.cardHint}>استخدم حساب Google للدخول بسرعة وأمان.</Text>
          <Pressable onPress={openAvailableLogin} disabled={loading} style={({ pressed }) => [styles.accountButton, { opacity: pressed || loading ? 0.7 : 1 }]}><Text style={styles.googleIcon}>G</Text><Text style={styles.accountButtonText}>{loading ? "جاري الفتح..." : "الدخول عبر Google"}</Text></Pressable>
          <Text style={styles.providerNote}>بعد الدخول يمكنك تغيير المظهر والتواصل مع الدعم من الإعدادات.</Text>
        </View>
        {message ? <View style={styles.messageBox}><Text style={styles.messageText}>{message}</Text></View> : null}
        <Text style={styles.terms}>بالمتابعة، أنت توافق على شروط استخدام wm.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: "#F8F7F2", flex: 1 }, backgroundShape: { backgroundColor: "#1D1A35", borderBottomLeftRadius: 110, height: 250, position: "absolute", right: 0, top: 0, width: "100%" }, container: { flex: 1, paddingHorizontal: 22, paddingTop: 20 }, brandMark: { alignItems: "center", alignSelf: "flex-end", backgroundColor: "#FFD166", borderRadius: 15, flexDirection: "row", paddingHorizontal: 12, paddingVertical: 7 }, brandText: { color: "#1D1A35", fontSize: 21, fontWeight: "900" }, brandDot: { backgroundColor: "#F08A75", borderRadius: 4, height: 7, marginLeft: 5, width: 7 }, eyebrow: { color: "#BDB9CD", fontSize: 12, fontWeight: "700", marginTop: 34, textAlign: "right" }, title: { color: "#FFFFFF", fontSize: 35, fontWeight: "900", lineHeight: 39, marginTop: 9, textAlign: "right" }, subtitle: { color: "#C8C4D6", fontSize: 13, lineHeight: 21, marginTop: 11, textAlign: "right" }, loginCard: { backgroundColor: "#FFFFFF", borderRadius: 24, marginTop: 42, padding: 18, shadowColor: "#1D1A35", shadowOpacity: 0.1, shadowRadius: 18, elevation: 4 }, cardTitle: { color: "#1D1A35", fontSize: 20, fontWeight: "900", marginBottom: 10, textAlign: "right" }, cardHint: { color: "#807B89", fontSize: 12, lineHeight: 20, marginBottom: 13, textAlign: "right" }, accountButton: { alignItems: "center", backgroundColor: "#F08A75", borderRadius: 14, flexDirection: "row", justifyContent: "center", paddingVertical: 14 }, googleIcon: { color: "#FFFFFF", fontSize: 19, fontWeight: "900", marginRight: 9 }, accountButtonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" }, providerNote: { color: "#A19DA7", fontSize: 10, lineHeight: 15, marginTop: 11, textAlign: "center" }, messageBox: { backgroundColor: "#FFF1D2", borderRadius: 12, marginTop: 12, padding: 12 }, messageText: { color: "#76571D", fontSize: 11, textAlign: "center" }, terms: { color: "#AAA6AF", fontSize: 10, marginTop: 18, textAlign: "center" },
});
