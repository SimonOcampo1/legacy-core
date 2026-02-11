export interface TimelineEvent {
    id: string;
    date: string; // e.g. "Dec 15"
    year: string; // e.g. "2023"
    location: string;
    title: string;
    description: string;
    image: string;
    attendees: string[]; // URLs or names
}

export const timelineEvents: TimelineEvent[] = [
    {
        id: "winter-reunion",
        date: "15 Dic",
        year: "2023",
        location: "Ciudad de Nueva York",
        title: "Reunión de Invierno",
        description: "Una cena caótica en el nuevo apartamento de Mark. Quemamos la lasaña, pero el vino y las historias lo compensaron. Sentí que no había pasado el tiempo.",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCIr2MyxEV_dH51JHk1zoYC0583g4X-HjWPSannUhQkESWlHcSMaOmwtplTjfjnblVol-sHcqz30FWMZc0CnWJ9rYjQGEbHrbw-uEiY22q50iJl_TV94q2TlExmkuHs9O_f2bZebjZRZDWTb6YIc2gRXrY0cHIiWDRWSPzoE59BeRkALXfIsGlhviSDXwLNEyEFwa59-0rGxpwImFCxJ75_CqAcJT3n2u251AcdgRRoMMV6EiNZ7NDWhKZxg5OHnhRNxOrUPHkAqsc",
        attendees: [
            "https://lh3.googleusercontent.com/aida-public/AB6AXuCeiEJBsrk5H-9Q1IqkmwBeohlhU60lD9yNRk6T7dEZh9FYIDnpTtDWrGGkoWQyjDyZt-9Ow_2yVNTkTGAZCq7xW0zkaSk6BRNv0wclevU-SNkB0CuPKtMfNrfIXpLEcApgqT_d-AiZTP4E8OyDXIuR3MW1GxL98tcz22idQVwfPzivpplnc9hwOszXZw_QXzEiyAyfTwTziItlEkQ_NwOH8SK87xD20ny54xOKqhRgah2M3tkTkkNA6LnkOTB79htTXkUbzInSm5k",
            "https://lh3.googleusercontent.com/aida-public/AB6AXuAhg9Ibo6ds_JLlp3kdsPgaR28wLA14wNfp7oWyQQwpM9zXOloJH9-0CC8s7j25NOJykimTRDacIMVbk2EBOc6yRAuDCQuJYFYz9Eh8LRZNEe_pHBAzePsruEou6s_dSyXDaJNWlN1IUJxdHu--Q11kLtaszn6KWAbN0T7otXwCu_N2L1EWKBqU5w4FkxoHsFWXgws_rTSoWx5pG0tIHCljT3HsF4M_vZXBewLsctJymUGy-8Ao0qlaQ5GF38oCQguTL2CqJT2zNtg"
        ]
    },
    {
        id: "graduation-day",
        date: "22 May",
        year: "2023",
        location: "Campus Universitario",
        title: "Día de Graduación",
        description: "El fin de una era, el comienzo de todo lo demás. Prometimos mantenernos en contacto sin importar a dónde nos llevara la vida.",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDwGnUcyeu8AHzhDBBcNYxqyl9XD56yhM3JNVayrq9McHNrqcZNrwIddXrsVuzDdX64su0tw0yafgjguJVZc5nCURyOE3EU2gyY7Boay8SlAHmkQqyXwUFydYLVGtRf3YjJsFlfZubWz15IfDZinVJlbvKx8Xk3TKlSbhBcbPZ6DgR2T8GmA5hLc7li2a21YZ3W_zC3204nW9PziEh6XsGiuCsJwJnTSLMHzBUmGL3WAdGirDNpHZeUu4Ywd8L1CdMNANX4oXIV0ck",
        attendees: [
            "https://lh3.googleusercontent.com/aida-public/AB6AXuAYk4MRrwg7h8TY3OcPdtnocv_LAVuVUhn_4uIBx_sT-xgUdkUqcjZ-iROOwzzA2lgc1y1BDphkGMi89zF_385XLulpixPunXAmThMZ327iPZy1WiLNZooteMe8p-xl2z_MSN98VcVAwKLdX91LIP_KxzX9UFr3IWcqV1o1IDlh1Aa176LkhuMZ9Vp3cUAqfussiyF-zN4Nfo-4uTQ8zGJgESx1RoldRlk9lnpIB_qyDJI9QAF1UkMKJC-29akf7k1eAOcdJRZLHxU",
            "https://lh3.googleusercontent.com/aida-public/AB6AXuAXeeEAYilviEAHFvOtx77K4GeG-OWzMze0y2gu5f6zuPl_NV6jDOKbYsDd03eZPGmhz-oSlrAyyH88Py925AF-Cvne8yLTAoXyruKjXK-Agdu7pp9Sy0MNoTjYgdWwtwbD2iGWST6EoBEiMPwivpE3R2Lq1BQ0Ms_KThKh5ARMSZhsgBR4EIfc7X6RFEmFvWBeBLjeT02e8_DIDjaeNiceDIiumF_kddHUMQRVbDEcw5G8zVR9JQIoM8ka79SA2q4agn2TLL98VD0",
            "https://lh3.googleusercontent.com/aida-public/AB6AXuD0Jyp_fSefPFcQWQFCbYw_QEn_sRr_CfKT5yECTQglH57IAov-c5s-Nr7JZaacuxoFSD0HhS_pos5sS5H1KiTJdGGNZNBZ1aAPwU2c6LfV1_ZGcu-WobySjXr5bqTnpAS7LISuXXRAfSPM2oggQKvQWoDA8darl8JU3_Z7Q17_roBh77UuGVbFmB9GZ4Gy50AXGNoDF3tA_8txbniXaliNnFJEeWDWbi4BoTAPx5RtftUNZZ1w0t_64ptYzAVfy1U-gem8jRl6C6o"
        ]
    },
    {
        id: "first-road-trip",
        date: "10 Nov",
        year: "2022",
        location: "Ruta 66",
        title: "Primer Viaje",
        description: "No sabíamos a dónde íbamos, pero la playlist era perfecta. El coche se estropeó dos veces, pero ¿honestamente? Esa fue la mejor parte.",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC7ycwYvT5X5OkzGeD2-ibdUS5e5y9AYL0HBr0-c3CtJ1P5xoccbmJfnUMlsPxqJ7JUYDgVb2jasdhMBy5YgkGiY02R4dvmveHulJlqV0brgHQEmGxul4Yg1WVQGE9BaG4Xx4KooTG4r0QbIuutqPJT3gN_VdfTUXjPxEdnm24gnvk0nj80LYTq1ViUaAXQsnUGhmOjsU_5ZAtw7NvCI7whShdhBZKW5aAfKWRO937SgRXHMP5qBRt7AS-vb-7JDC5UvtvluJj-QEE",
        attendees: []
    },
    {
        id: "last-exam",
        date: "15 May",
        year: "2022",
        location: "Biblioteca Principal",
        title: "El Último Examen",
        description: "Son las 4 AM en la biblioteca. Vasos de café apilados como torres. El delirio llegando justo antes de que saliera el sol.",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCBkin3LDG0iipggRecF7lxpFRVeCMhZhMENizNni-LB4pmQIEAU5eR3IK6wUZuBCz6BmviozGywTc25FzuW9I7NuwaoLTm73koBokFHXM8xR7GX6whcc0Ika4KvnKD8Fm7ven7qw_sbPSTHs_isDiOjdrN972CYVVMCG00Q7N3wEwwHemb6dzgmMST06iBmwzmjhH9ZaIytxffXMaKuMnba27g5HMCCn1KbjSAYcneS6lqKppHb3Lepv43n4OVOWpcNCvgY7x46I8",
        attendees: []
    }
];
