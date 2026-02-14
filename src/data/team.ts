export interface TeamMember {
    name: string;
    position: string;
    university: string;
    country: string;
    researchInterests: string[];
    contact: string;
    linkedin?: string;
    website?: string;
    image?: string;
}

export const team: TeamMember[] = [
    {
        name: "Dr. Mahima Weerasinghe",
        position: "Researcher / Lead – Neuroinformatics",
        university: "Sri Lanka Institute of Information Technology",
        country: "Sri Lanka",
        researchInterests: [
            "Computational Neuroscience",
            "Artificial Neural Networks",
            "AI in Health",
            "AI in Agriculture"
        ],
        contact: "mahima.w@sliit.lk",
        linkedin: "https://www.linkedin.com/in/mahimaweerasinghe/",
        image: "/assets/images/mahima-weerasinghe.jpeg"
    },
    {
        name: "Dr. Dinuka Sahabandu",
        position: "Researcher / Lead – Efficient AI",
        university: "University of Washington",
        country: "USA",
        researchInterests: [
            "Optimization",
            "Reinforcement Learning",
            "Efficient Machine Learning",
            "AI Ethics",
            "Security in Machine Learning"
        ],
        contact: "dinuka.s@sliit.lk",
        linkedin: "https://www.linkedin.com/in/dinuka-sahabandu-48898726b/",
        image: "/assets/images/dinuka-sahabandu.jpeg"
    },
    {
        name: "Dr. Dharshana Kasthurirathna",
        position: "Senior Researcher / Mentor",
        university: "Sri Lanka Institute of Information Technology",
        country: "Sri Lanka",
        researchInterests: [
            "Evolutionary Game Theory",
            "AI Ethics",
            "Security in Machine Learning",
            "Machine Learning"
        ],
        contact: "dharshana.k@sliit.lk",
        linkedin: "https://www.linkedin.com/in/dharshana-kasthurirathna-a4a3275/",
        image: "/assets/images/dharshana_kasthurirathna.jpeg"
    },
    {
        name: "Dr. Kapila Dissanayaka",
        position: "Researcher / Lead – Explainable AI",
        university: "Sri Lanka Institute of Information Technology",
        country: "Sri Lanka",
        researchInterests: [
            "Computational Neuroscience",
            "Artificial Neural Networks",
            "AI in Health",
            "AI in Agriculture"
        ],
        contact: "kapila.d@sliit.lk",
        linkedin: "https://www.linkedin.com/in/kapila-d-dissanayaka/",
        image: "/assets/images/kapila_dissanayaka.jpeg"
    },
    {
        name: "Mr. Jeewaka Perera",
        position: "Researcher",
        university: "Sri Lanka Institute of Information Technology",
        country: "Sri Lanka",
        researchInterests: [
            "Reinforcement Learning",
            "Bio-Inspired Machine Learning",
            "AI Ethics",
            "Security in Machine Learning",
            "Machine Learning"
        ],
        contact: "jeewaka.p@sliit.lk",
        linkedin: "https://www.linkedin.com/in/jeewakaperera/",
        image: "/assets/images/jeewaka_perera.jpeg"
    },
    {
        name: "Ms. Madhumini Gunaratne",
        position: "Graduate Research Assistant",
        university: "Sri Lanka Institute of Information Technology",
        country: "Sri Lanka",
        researchInterests: [
            "Computational Neuroscience",
            "Artificial Neural Networks",
            "AI in Health",
            "AI in Agriculture"
        ],
        contact: "madhumini.g@sliit.lk",
        image: "/assets/images/madhumini_gunaratne.jpeg"
    },
    {
        name: "Mr. Asiri Gawesha",
        position: "Graduate Research Assistant / MPhil Student",
        university: "Sri Lanka Institute of Information Technology",
        country: "Sri Lanka",
        researchInterests: [
            "Computational Optimization in Machine Learning",
            "Federate Learning",
            "Edge AI",
            "Computer Vision"
        ],
        contact: "asiri.g@sliit.lk",
        linkedin: "https://www.linkedin.com/in/asiri-gawesha-090617168/",
        image: "/assets/images/asiri_gawesha.jpeg"
    },
    {
        name: "Mr. Sanka Mohottala",
        position: "Academic Instructor / MPhil Student",
        university: "Sri Lanka Institute of Information Technology",
        country: "Sri Lanka",
        researchInterests: [
            "Computer Vision",
            "Graph Neural Networks",
            "Applications of Deep Learning in Scientific Domains",
            "Brain-Inspired Neural Networks"
        ],
        contact: "sanka.m@sliit.lk",
        linkedin: "https://www.linkedin.com/in/sankamohottala/",
        image: "/assets/images/sanka_mohottala.jpeg"
    }
];
