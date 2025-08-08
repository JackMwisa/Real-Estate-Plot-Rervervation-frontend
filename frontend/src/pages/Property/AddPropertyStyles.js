///// src/pages/AddPropertyStyles.js
const palette = {
  lightPrimary: "#4CAF50",
  lightPrimaryHover: "#43a047",
  darkPrimary: "#0ea5e9",
  darkPrimaryHover: "#0284c7",
};

const styles = {
  pageWrap: (theme) => ({
    maxWidth: 1100,
    margin: "32px auto",
    paddingLeft: 16,
    paddingRight: 16,
    [theme.breakpoints.up("sm")]: { paddingLeft: 24, paddingRight: 24 },
  }),

  paper: (theme) => ({
    padding: theme.spacing(4),
    borderRadius: 10,
    background: theme.palette.mode === "dark" ? "#0b1220" : "#ffffff",
    boxShadow:
      theme.palette.mode === "dark"
        ? "0 8px 30px rgba(0,0,0,.4)"
        : "0 12px 28px rgba(0,0,0,.08)",
  }),

  header: (theme) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: theme.spacing(3),
  }),

  title: (theme) => ({
    fontWeight: 800,
    letterSpacing: 0.2,
    background:
      theme.palette.mode === "dark"
        ? `linear-gradient(90deg, ${palette.darkPrimary}, #6ee7f9)`
        : `linear-gradient(90deg, ${palette.lightPrimary}, #9ae6b4)`,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  }),

  section: (theme) => ({
    padding: theme.spacing(2),
    borderRadius: 8,
    border:
      theme.palette.mode === "dark"
        ? "1px solid rgba(255,255,255,.08)"
        : "1px solid rgba(0,0,0,.08)",
    background:
      theme.palette.mode === "dark"
        ? "rgba(255,255,255,.03)"
        : "rgba(0,0,0,.02)",
  }),

  /// Block-style inputs
  field: (theme) => ({
    display: "block",
    width: "100%",
    marginBottom: theme.spacing(2),
    "& .MuiOutlinedInput-root": {
      borderRadius: 10,
    },
  }),

  submitBtn: (theme) => ({
    display: "block",
    width: "100%",
    marginTop: theme.spacing(2),
    paddingTop: theme.spacing(1.5),
    paddingBottom: theme.spacing(1.5),
    textTransform: "none",
    fontWeight: 700,
    borderRadius: 2,
    boxShadow:
      theme.palette.mode === "dark"
        ? "0 8px 16px rgba(14,165,233,.25)"
        : "0 8px 16px rgba(76,175,80,.25)",
    backgroundColor:
      theme.palette.mode === "dark"
        ? palette.darkPrimary
        : palette.lightPrimary,
    "&:hover": {
      backgroundColor:
        theme.palette.mode === "dark"
          ? palette.darkPrimaryHover
          : palette.lightPrimaryHover,
    },
  }),

  mapWrap: {
    height: 380,
    borderRadius: 12,
    overflow: "hidden",
    border: "1px solid rgba(0,0,0,.12)",
  },

  coords: (theme) => ({
    marginTop: theme.spacing(1),
    color: theme.palette.text.secondary,
  }),

  imageGrid: (theme) => ({
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: theme.spacing(2),
    [theme.breakpoints.up("sm")]: { gridTemplateColumns: "1.2fr 1fr" },
  }),

  uploadPrimary: (theme) => ({
    borderRadius: 12,
    padding: theme.spacing(1.5),
    textTransform: "none",
    fontWeight: 600,
  }),

  preview: {
    marginTop: 12,
    borderRadius: 12,
    width: "100%",
    height: "auto",
    objectFit: "cover",
    boxShadow: "0 4px 14px rgba(0,0,0,.12)",
  },

  uploadStackBtn: (theme) => ({
    width: "100%",
    borderRadius: 12,
    padding: theme.spacing(1.25),
    textTransform: "none",
    justifyContent: "flex-start",
    fontWeight: 600,
  }),
};

export default styles;
