/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        obsidian: '#0A0C10',
        carbon: '#141820',
        graphite: '#1E2330',
        slate: {
          wire: '#2A3040'
        },
        bone: '#E8E0D4',
        parchment: '#C4B9A8',
        copper: '#48A89C',
        rust: '#C4553A',
        gold: '#B8963E',
        cyan: {
          blueprint: '#1A3A4A'
        }
      },
      fontFamily: {
        display: ['CormorantGaramond-SemiBold'],
        mono: ['IBMPlexMono-Regular'],
        monoBold: ['IBMPlexMono-SemiBold'],
        body: ['CrimsonPro-Regular']
      }
    },
  },
  plugins: [],
}
