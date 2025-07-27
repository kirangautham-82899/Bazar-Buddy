export default function LoginPage() {
  const [params] = useSearchParams();
  const lang = params.get("lang") || "en";
  const navigate = useNavigate();

  const t = {
    en: {
      title: "Login",
      email: "Email",
      password: "Password",
      button: "Login"
    },
    hi: {
      title: "लॉगिन करें",
      email: "ईमेल",
      password: "पासवर्ड",
      button: "लॉगिन"
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <motion.div
        className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-2xl font-semibold text-center mb-4">{t[lang].title}</h2>
        <form className="space-y-4">
          <input type="email" placeholder={t[lang].email} className="input-field" />
          <input type="password" placeholder={t[lang].password} className="input-field" />
          <button type="submit"
                  className="w-full bg-green-500 text-white py-2 rounded-xl hover:bg-green-600">
            {t[lang].button}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
