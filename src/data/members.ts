import type { Member } from "../types";

export const members: Member[] = [
    {
        id: "eleanor-rigby",
        name: "Eleanor Rigby",
        role: "History of Art",
        quote: "\"Remembering the sunrise sketch sessions on the library roof.\"",
        imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDzCUZg4rxhbo5Kc0xfjF23jOeEegTWqoMSZU32gyWDrE01OmLZLsy3dxuwSaFRO7sr4aiilHNYM07CJJh2t8BYPLP2t9pq7bVfrCXJJk2cV-mBDavPyiDlQdsfDfSUGsdnQ84kXHzR0dH4-RuT0f0UY_lU9TsTZ5gf92OIuE18gayFCmgURUEqQ8AZOM_1FCJhR2EYp2shQxxQTA_pLwHWDEgSlK2I2u2PES3V5VdpH4NBHbROpLiufPLpnJJ0YWDiOFwbE4amTAc",
        bioIntro: "\"Currently restoring a Victorian home in upstate New York. Still obsessed with dark academia aesthetics and brewing the perfect cup of Earl Grey.\"",
        bio: "Remembering the nights we spent in the library archives. After graduation, I spent three years in Florence studying Renaissance preservation before returning to the states. I'm now working as a consultant for historical societies across New England.",
        honors: ["Class of 2014", "History of Art", "Magna Cum Laude"],
        socials: { email: true, linkedin: true },
        narratives: [
            {
                id: "01",
                date: "Oct 12, 2023",
                title: "The Midnight Library Sessions",
                excerpt: "Reflecting on the quiet chaos of finals week, the smell of old paper, and the friendships forged in the silence of the stacks."
            },
            {
                id: "02",
                date: "Sep 05, 2023",
                title: "A Toast to the Old Dorms",
                excerpt: "Before the renovation erased the graffiti and the creaky floorboards, we gathered one last time to say goodbye to the place we called home."
            },
            {
                id: "03",
                date: "Aug 22, 2023",
                title: "The 2012 Winter Ball Incident",
                excerpt: "It wasn't about the music or the decorations. It was the unexpected snowstorm that trapped us inside the Great Hall until dawn."
            }
        ]
    },
    {
        id: "marcus-chen",
        name: "Marcus Chen",
        role: "Computer Science",
        quote: "\"Still have the code for our terrible freshman year hackathon project.\"",
        imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAUuoYpcpVSxDFu7kPn6v9CAjwRir6_arAH96YlDy7eqgjWwZ-AknOqFhnCanEf0zZ2Vlsq7fT0do5jzqqmMlzkfPX1MngNiXZKGz8v77M-hrb7GNrQ1cWiXo2gXogkshHqSCbWH0AUu-lZZQfS1r7k5VgisundJgcFBGub0L4YVJFRi-iKapWYivLZ-u_crFSk-N4GDKseTSuyY8mcKLU_LMu3v7NEW5TFGgx55NQfDTUiJPgdG6E4Q0udixkCovkqmwpkUxBN-O4",
        honors: ["Class of 2014", "Computer Science", "Summa Cum Laude"],
        bioIntro: "\"Building the future of decentralized networks. Still hacking, still caffeinated.\"",
        bio: "After leaving campus, I spent a few years in SV before realizing I missed the rain. Now leading a small dev team in Seattle. Married to Sarah since 2018.",
        narratives: []
    },
    {
        id: "sarah-jenkins",
        name: "Sarah Jenkins",
        role: "Journalism",
        quote: "\"The Daily Tribune office coffee was terrible, but the company was the best.\"",
        imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuC12l_CUI0L8Cg-GazHVSVJH5biiG52_MU_ZtI0PCCrejyZN4NamLpFAiUg_ZZngWtszeBN_QCFQSZftiASIBRyDZL0e9VBkJp6gqgsGRVKTU5rTUcv1KUlYm7XKbeKCk1JQ5HzhJjy6XbCVATPBIpDRdhGH4Nf_MxCLmxYFXC0HvcXEdWLVFTfPeGCoGnrYKtFbCTHFhn25QZgRCTl85rsV1cqvz6Hhu3kr2_-lJBhg6rlne9Dk_Y59Ujx0zFnUVjpWxBXHo4mj64",
    },
    {
        id: "david-rossi",
        name: "David Rossi",
        role: "Architecture",
        quote: "\"Building models until 4am and eating cold pizza.\"",
        imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDYEUGKbkDViA9O5_u6TFvxWoa4Z_37xJ_05RfqfYpC8bGKIbMKbPZ8SozWEiIBQu1row-hldzpYhVG0YmpFDm43R-j-pfW2eB0BseMRBliHhTqbleLsvAheQOYiN9Ghe-z1XnmRFXuK1k0TflUB-42O44dqSEA_Bc04fJpn4JnKs-bCayP9DP8nhPhqqhI2kg3aMsgYNe6KjQpoLD1o6UAZQHPyRUqgU_B25yqSQ26qmcU4qICjZryR_gtOLolXbGMacdUZI57lCA",
    },
    {
        id: "priya-patel",
        name: "Priya Patel",
        role: "Political Science",
        quote: "\"Campaign strategy meetings in the dorm lounge.\"",
        imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDx38wGULRkCFAZfX2Jmbq0XV2d7ZjojcD3wFAj7NBc39Cd5SgVhAqszh6OtSdSN8zBjfE8N2aRGXQvadcqATN5_tTp2TyDRPwomw-AoejrS6q-kHKk6KluUx-fNX3ajjbj4BoYeKTagtnHVCqpPlR6-DQ0msAbXl9osd4U-yDnJXzcLzSQv1iwOyBTNzhU2N2uud8gZZyct2KJwYuz94iUmCe48x7q1vCwXrM-a4-3cgqAaCeNAbcXCGSfsUL-JSsXRsKk87TYdr8",
    },
    {
        id: "james-wilson",
        name: "James Wilson",
        role: "Economics",
        quote: "\"Macro theory debates that lasted way too long.\"",
        imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAl3pFX7JeAAEnFj4xNB4Edrkg7yYTWisFidVS_tR-MouTPhMfJnln2R-4pE-DKZJFVTF5rg-RC3HPrSvww_rf6zI58rnVFODX5ksJa2QIOscO2anhtpzsq0YnBv1l8tlTXuYsQ4YgaSia8XVxQrHdwjxrcTu0BWlwy0rmtmC7VMgkTEGnLrhI2ppcq7yZieVlZvznIA1esu7ir1izXyYL-2npWA3g9AL7h6ohdcG_LTYYlo_tIDgZUOl3PU6sWb6Q-e6ITyfR59_4",
    },
    {
        id: "aisha-khan",
        name: "Aisha Khan",
        role: "Bioengineering",
        quote: "\"Lab coat life and the endless pursuit of perfect data.\"",
        imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDVsImNiY55A88TDvMgtI0KLtH6hj18RzJxwGvlCf5ZstcMjjA9Ot0ALLhEzjQ5BKJVtnwFnG_5k2XxRghaWtlufxRHFpoefyRDcP6pYGf90MeMvGTe-BAauxvzOGM7LAhg6wrP7EMNs4kz6X-WUaTuQL6zIkM3E_mJl0ItmMofADrsaX070vfung6RMc82ZFgOw1i095w4wJoUZKyRd563l1za9macBXKgSmGJdV7bsgRv2nEeqXqk8_DEf8QdTSsB1ic9o980vLU",
    },
    {
        id: "thomas-anderson",
        name: "Thomas Anderson",
        role: "Philosophy",
        quote: "\"Existential dread over coffee on the quad.\"",
        imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAq3lt7q3HtRLsYX1ObMDnAH4INwqrUjcqKjwI3-pelj35j80XLg4rLx2mRKnQtt7HVmAOoP_WfBp6mBtiodbWjDggN1WsG1qz6-20Q4JFSnMEqlrE-XlWrRyTDK6Kq1Ge-G5OUiAKWaOUrLPebFlGd49vXa3sZM_vyGnXUoUgzg_r77LQLQTAcwI4My0qwssipJb-98wVOOl8JvgevUc-B9OE0hXwS1IkxNcjcL4fpGhzMqHFGOILoZg6_8y3WMmnzUBXHjzIFsxg",
    },
];
