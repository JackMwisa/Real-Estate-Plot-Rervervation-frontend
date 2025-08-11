
const palette = {
  lightPrimary: "#16a34a",       // richer green
  lightPrimaryHover: "#15803d",
  darkPrimary: "#0ea5e9",        // cyan/blue accent for dark
  darkPrimaryHover: "#0284c7",
};

const styles = {
  pageWrap: (theme) => ({
    maxWidth: 1120,
    margin: "32px auto",
    paddingLeft: 16,
    paddingRight: 16,
    [theme.breakpoints.up("sm")]: { paddingLeft: 24, paddingRight: 24 },
  }),

  paper: (theme) => ({
    padding: theme.spacing(3),
    [theme.breakpoints.up("sm")]: { padding: theme.spacing(4) },
    borderRadius: 16,
    background:
      theme.palette.mode === "dark"
        ? "linear-gradient(180deg, rgba(8,13,23,.9) 0%, rgba(12,18,32,.9) 100%)"
        : "#ffffff",
    border:
      theme.palette.mode === "dark"
        ? "1px solid rgba(255,255,255,.06)"
        : "1px solid rgba(0,0,0,.06)",
    boxShadow:
      theme.palette.mode === "dark"
        ? "0 20px 45px rgba(0,0,0,.45)"
        : "0 16px 40px rgba(0,0,0,.08)",
  }),

  header: (theme) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: theme.spacing(3),
  }),

  title: (theme) => ({
    fontWeight: 900,
    letterSpacing: 0.2,
    lineHeight: 1.2,
    background:
      theme.palette.mode === "dark"
        ? `linear-gradient(90deg, ${palette.darkPrimary}, #22d3ee)`
        : `linear-gradient(90deg, ${palette.lightPrimary}, #34d399)`,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  }),

  section: (theme) => ({
    padding: theme.spacing(2),
    [theme.breakpoints.up("sm")]: { padding: theme.spacing(2.5) },
    borderRadius: 14,
    border:
      theme.palette.mode === "dark"
        ? "1px solid rgba(255,255,255,.06)"
        : "1px solid rgba(0,0,0,.06)",
    background:
      theme.palette.mode === "dark"
        ? "rgba(255,255,255,.03)"
        : "rgba(0,0,0,.02)",
  }),

  // Block-style inputs + consistent focus ring
  field: (theme) => ({
    display: "block",
    width: "100%",
    "& .MuiOutlinedInput-root": {
      borderRadius: 12,
      transition: "box-shadow .2s ease",
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor:
          theme.palette.mode === "dark"
            ? palette.darkPrimary
            : palette.lightPrimary,
      },
      "&.Mui-focused": {
        boxShadow:
          theme.palette.mode === "dark"
            ? "0 0 0 3px rgba(14,165,233,.25)"
            : "0 0 0 3px rgba(22,163,74,.18)",
      },
    },
  }),

  labelCaps: {
    textTransform: "uppercase",
    letterSpacing: ".06em",
    fontSize: 12,
    opacity: 0.9,
    marginBottom: 8,
    fontWeight: 700,
  },

  submitBtn: (theme) => ({
    display: "block",
    width: "100%",
    marginTop: theme.spacing(1),
    paddingTop: theme.spacing(1.5),
    paddingBottom: theme.spacing(1.5),
    textTransform: "none",
    fontWeight: 800,
    borderRadius: 12,
    boxShadow:
      theme.palette.mode === "dark"
        ? "0 10px 24px rgba(14,165,233,.25)"
        : "0 10px 24px rgba(22,163,74,.25)",
    backgroundColor:
      theme.palette.mode === "dark" ? palette.darkPrimary : palette.lightPrimary,
    "&:hover": {
      backgroundColor:
        theme.palette.mode === "dark"
          ? palette.darkPrimaryHover
          : palette.lightPrimaryHover,
    },
  }),

  mapWrap: (theme) => ({
    height: 380,
    borderRadius: 14,
    overflow: "hidden",
    border:
      theme.palette.mode === "dark"
        ? "1px solid rgba(255,255,255,.06)"
        : "1px solid rgba(0,0,0,.06)",
  }),

  coords: (theme) => ({
    marginTop: theme.spacing(1),
    color: theme.palette.text.secondary,
    fontVariantNumeric: "tabular-nums",
  }),

  imageGrid: (theme) => ({
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: theme.spacing(2),
    [theme.breakpoints.up("sm")]: { gridTemplateColumns: "1.25fr 1fr" },
  }),

  uploadPrimary: (theme) => ({
    borderRadius: 12,
    padding: theme.spacing(1.5),
    textTransform: "none",
    fontWeight: 700,
  }),

  preview: {
    marginTop: 12,
    borderRadius: 12,
    width: "100%",
    height: "auto",
    objectFit: "cover",
    boxShadow: "0 6px 20px rgba(0,0,0,.12)",
  },

  uploadStackBtn: (theme) => ({
    width: "100%",
    borderRadius: 12,
    padding: theme.spacing(1.25),
    textTransform: "none",
    justifyContent: "flex-start",
    fontWeight: 700,
  }),

  inline: {
    display: "flex",
    gap: 8,
  },
};

export default styles;
