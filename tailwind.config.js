/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        papel: '#F4F1EA',
        tinta: '#1A1A1A',
        goles: '#A32D2D',
        araguari: '#185FA5',
        ipe: '#EF9F27',
        muted: '#73706B',
        linha: '#DED9CF',
      },
      fontFamily: {
        'title': ['Lora', 'Georgia', 'Times New Roman', 'serif'],
        'sans': ['"DM Sans"', 'Arial', 'Helvetica Neue', 'Helvetica', 'sans-serif'],
        'emoji': ['Segoe UI Emoji', 'sans-serif'],
        'coeps': ['Georgia', 'Times New Roman', 'serif'],
        'cieps-display': ['Georgia', 'Times New Roman', 'serif'],
        'cieps-body': ['Arial', 'Helvetica Neue', 'Helvetica', 'sans-serif']
      }
    },
  },
  plugins: [],
};
