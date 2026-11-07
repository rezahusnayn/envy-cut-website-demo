/* All shop details live here. Edit this file to update the site.
   Colours and fonts are at the top of css/styles.css. */
window.SHOP = {
  // Set to false once prices and photos are confirmed.
  // Removes the preview notice and adds search-engine business data.
  isPlaceholder: true,

  name: "Envy Hair Cut Design",

  // International format, digits only. The salon's number is 60125554698.
  // Blank in the public demo: WhatsApp then asks the sender to pick a contact,
  // so test bookings can't reach the salon. Fill in at launch.
  whatsapp: "",
  phone: "012-555 4698",
  phoneHref: "+60125554698",

  address: "No. 9126, Jalan Bandar 4, Taman Melawati, 53100 Kuala Lumpur",
  mapQuery: "Envy Hair Cut Design, Jalan Bandar 4, Taman Melawati, 53100 Kuala Lumpur",

  // From Google, as seen on 7 November 2026.
  rating: 4.5,
  reviewCount: 44,

  // 0 = Sunday ... 6 = Saturday. null = closed. 24-hour time.
  hours: {
    0: ["09:30", "18:00"],
    1: ["09:30", "18:00"],
    2: ["09:30", "18:00"],
    3: ["09:30", "18:00"],
    4: ["09:30", "18:00"],
    5: ["09:30", "18:00"],
    6: ["09:30", "18:00"],
  },
  slotMinutes: 30,

  // TO CONFIRM: every price and duration below is a placeholder.
  // from: true shows "from RM..".
  services: [
    { id: "women", price: 45, mins: 45,
      en: { name: "Women's cut", note: "Layers, shapes and curly hair" },
      ms: { name: "Gunting wanita", note: "Lapisan, bentuk dan rambut kerinting" } },
    { id: "men", price: 30, mins: 30,
      en: { name: "Men's cut", note: "Scissors or clippers" },
      ms: { name: "Gunting lelaki", note: "Gunting atau klipper" } },
    { id: "fringe", price: 15, mins: 15,
      en: { name: "Fringe trim", note: "A quick tidy between cuts" },
      ms: { name: "Potong fringe", note: "Kemas cepat antara potongan" } },
    { id: "wash", price: 25, mins: 30,
      en: { name: "Wash and blow-dry", note: "Washed, dried and styled" },
      ms: { name: "Cuci dan blow-dry", note: "Dicuci, dikeringkan dan digayakan" } },
    { id: "colour", price: 120, mins: 120, from: true,
      en: { name: "Colour", note: "Price depends on hair length" },
      ms: { name: "Warna", note: "Harga bergantung pada panjang rambut" } },
    { id: "highlights", price: 180, mins: 150, from: true,
      en: { name: "Highlights", note: "Price depends on hair length" },
      ms: { name: "Highlight", note: "Harga bergantung pada panjang rambut" } },
  ],

  // Zen is named in a Google review. Add the rest of the team here.
  stylists: ["Zen"],

  // Quoted from Google reviews, so don't reword them. "..." marks a cut.
  reviews: [
    { name: "Golden Horse", text: "I have very curly hair. Many saloons have disappointed me ... I gave Envy a shot and I have to say I AM SO SATISFIED." },
    { name: "Izzuddin", text: "My go-to for haircut and wash in Taman Melawati. No issues with parking, no need to go into a mall. Good service." },
    { name: "Dania", text: "Been going here for years and they always get my hair right" },
    { name: "Wei Hwang", text: "Spacious and clean interior. Friendly folks. Reasonable pricing." },
  ],
};
