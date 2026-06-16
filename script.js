// ===== BASE DE DONNÉES LOCALE =====
let biens = JSON.parse(localStorage.getItem('biens')) || [];

// ===== FONCTIONS DE SAUVEGARDE =====
function sauvegarderBiens() {
    localStorage.setItem('biens', JSON.stringify(biens));
    mettreAJourStats();
}

// ===== AJOUTER UN BIEN =====
function ajouterBien(event) {
    event.preventDefault();
    
    // Récupérer les équipements cochés
    const equipements = [];
    document.querySelectorAll('input[id^="equip_"]:checked').forEach(checkbox => {
        equipements.push(checkbox.value);
    });
    
    const nouveauBien = {
        id: Date.now(),
        titre: document.getElementById('titre').value,
        type: document.getElementById('type').value,
        transaction: document.getElementById('transaction').value,
        prix: document.getElementById('prix').value,
        superficie: document.getElementById('superficie').value,
        chambres: document.getElementById('chambres').value,
        sallesBain: document.getElementById('sallesBain').value,
        etages: document.getElementById('etages').value,
        annee: document.getElementById('annee').value,
        parking: document.getElementById('parking').value,
        ville: document.getElementById('ville').value,
        quartier: document.getElementById('quartier').value,
        adresse: document.getElementById('adresse').value,
        description: document.getElementById('description').value,
        image: document.getElementById('image').value || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600',
        imagesSupp: document.getElementById('imagesSupp').value,
        equipements: equipements,
        dateAjout: new Date().toLocaleDateString('fr-TN')
    };
    
    biens.push(nouveauBien);
    sauvegarderBiens();
    
    // Message de succès avec animation
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message-success';
    messageDiv.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 1.5rem 2rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 9999;
        animation: slideInRight 0.5s;
    `;
    messageDiv.innerHTML = '✅ Bien ajouté avec succès!';
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
    
    // Réinitialiser le formulaire
    document.getElementById('formBien').reset();
    
    // Rafraîchir la liste
    afficherBiensAdmin();
    
    // Scroll vers la liste
    document.querySelector('.admin-list').scrollIntoView({ behavior: 'smooth' });
}

// ===== AFFICHER LES BIENS (PAGE D'ACCUEIL) =====
function afficherBiens(biensAfficher = biens) {
    const listeBiens = document.getElementById('listeBiens');
    const aucunBien = document.getElementById('aucunBien');
    
    if (!listeBiens) return;
    
    if (biensAfficher.length === 0) {
        listeBiens.style.display = 'none';
        if (aucunBien) aucunBien.style.display = 'block';
        return;
    }
    
    listeBiens.style.display = 'grid';
    if (aucunBien) aucunBien.style.display = 'none';
    
    listeBiens.innerHTML = biensAfficher.map(bien => `
        <div class="bien-card">
            <img src="${bien.image}" alt="${bien.titre}" class="bien-image" onerror="this.src='https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600'">
            <div class="bien-content">
                <span class="bien-type">${bien.type}</span>
                <h3>${bien.titre}</h3>
                <p class="bien-prix">
                    ${parseInt(bien.prix).toLocaleString('fr-TN')} TND
                    <small>${bien.transaction === 'location' ? '/mois' : ''}</small>
                </p>
                <div class="bien-details">
                    ${bien.superficie ? `<span>📐 ${bien.superficie}m²</span>` : ''}
                    ${bien.chambres ? `<span>🛏️ ${bien.chambres} ch.</span>` : ''}
                    ${bien.sallesBain ? `<span>🚿 ${bien.sallesBain} sdb</span>` : ''}
                    ${bien.parking === 'oui' ? `<span>🚗 Parking</span>` : ''}
                </div>
                <p class="bien-localisation">📍 ${bien.quartier}, ${bien.ville}</p>
                <p class="bien-description">${bien.description.substring(0, 120)}...</p>
                ${bien.equipements && bien.equipements.length > 0 ? `
                    <div class="bien-equipements">
                        ${bien.equipements.slice(0, 3).map(eq => `<span class="equipement-tag">${eq}</span>`).join('')}
                        ${bien.equipements.length > 3 ? `<span class="equipement-tag">+${bien.equipements.length - 3}</span>` : ''}
                    </div>
                ` : ''}
                <button class="btn-contact" onclick="contacterAgent('${bien.titre.replace(/'/g, "\\'")}', '${bien.type}', '${bien.ville}')">
                    📱 Contacter l'agent
                </button>
            </div>
        </div>
    `).join('');
    
    // Mettre à jour le compteur
    const biensCount = document.getElementById('biensCount');
    if (biensCount) {
        biensCount.textContent = biens.length;
    }
}

// ===== AFFICHER LES BIENS EN ADMIN =====
function afficherBiensAdmin() {
    const adminListe = document.getElementById('adminListeBiens');
    const countBiens = document.getElementById('countBiens');
    
    if (!adminListe) return;
    
    if (countBiens) {
        countBiens.textContent = biens.length;
    }
    
    if (biens.length === 0) {
        adminListe.innerHTML = '<p style="text-align: center; color: var(--gray); padding: 3rem;">Aucun bien enregistré. Ajoutez votre premier bien ci-dessus!</p>';
        return;
    }
    
    adminListe.innerHTML = biens.map(bien => `
        <div class="admin-bien-item">
            <div>
                <strong>${bien.titre}</strong><br>
                <small>
                    ${bien.type} • ${bien.transaction} • ${parseInt(bien.prix).toLocaleString('fr-TN')} TND • 
                    ${bien.ville}, ${bien.quartier}
                    ${bien.superficie ? ` • ${bien.superficie}m²` : ''}
                </small>
            </div>
            <button class="btn-delete" onclick="supprimerBien(${bien.id})">
                🗑️ Supprimer
            </button>
        </div>
    `).join('');
}

// ===== SUPPRIMER UN BIEN =====
function supprimerBien(id) {
    if (confirm('⚠️ Êtes-vous sûr de vouloir supprimer ce bien? Cette action est irréversible.')) {
        biens = biens.filter(bien => bien.id !== id);
        sauvegarderBiens();
        afficherBiensAdmin();
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message-success';
        messageDiv.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: #ef4444;
            color: white;
            padding: 1.5rem 2rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 9999;
        `;
        messageDiv.innerHTML = '✅ Bien supprimé avec succès!';
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }
}

// ===== FILTRER LES BIENS =====
function filtrerBiens() {
    const typeFilter = document.getElementById('typeFilter').value;
    const transactionFilter = document.getElementById('transactionFilter').value;
    const villeFilter = document.getElementById('villeFilter').value;
    const budgetMax = document.getElementById('budgetMax').value;
    
    let biensFiltres = biens;
    
    if (typeFilter) {
        biensFiltres = biensFiltres.filter(bien => bien.type === typeFilter);
    }
    
    if (transactionFilter) {
        biensFiltres = biensFiltres.filter(bien => bien.transaction === transactionFilter);
    }
    
    if (villeFilter) {
        biensFiltres = biensFiltres.filter(bien => bien.ville === villeFilter);
    }
    
    if (budgetMax) {
        biensFiltres = biensFiltres.filter(bien => parseInt(bien.prix) <= parseInt(budgetMax));
    }
    
    afficherBiens(biensFiltres);
}

// ===== FILTRER PAR TRANSACTION (TABS) =====
function filtrerParTransaction(transaction) {
    // Gérer l'état actif des tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    if (transaction === '') {
        afficherBiens(biens);
    } else {
        const biensFiltres = biens.filter(bien => bien.transaction === transaction);
        afficherBiens(biensFiltres);
    }
}

// ===== RÉINITIALISER FILTRES =====
function reinitialiserFiltre() {
    document.getElementById('typeFilter').value = '';
    document.getElementById('transactionFilter').value = '';
    if (document.getElementById('villeFilter')) {
        document.getElementById('villeFilter').value = '';
    }
    document.getElementById('budgetMax').value = '';
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector('.tab-btn').classList.add('active');
    
    afficherBiens(biens);
}

// ===== FILTRER BIENS ADMIN =====
function filtrerBiensAdmin() {
    const typeFilter = document.getElementById('adminTypeFilter').value;
    const transactionFilter = document.getElementById('adminTransactionFilter').value;
    
    let biensFiltres = biens;
    
    if (typeFilter) {
        biensFiltres = biensFiltres.filter(bien => bien.type === typeFilter);
    }
    
    if (transactionFilter) {
        biensFiltres = biensFiltres.filter(bien => bien.transaction === transactionFilter);
    }
    
    // Afficher temporairement les biens filtrés
    const adminListe = document.getElementById('adminListeBiens');
    adminListe.innerHTML = biensFiltres.map(bien => `
        <div class="admin-bien-item">
            <div>
                <strong>${bien.titre}</strong><br>
                <small>
                    ${bien.type} • ${bien.transaction} • ${parseInt(bien.prix).toLocaleString('fr-TN')} TND • 
                    ${bien.ville}, ${bien.quartier}
                </small>
            </div>
            <button class="btn-delete" onclick="supprimerBien(${bien.id})">
                🗑️ Supprimer
            </button>
        </div>
    `).join('');
}

// ===== CONTACTER L'AGENT =====
function contacterAgent(titreBien, typeBien, ville) {
    const message = `Bonjour,\n\nJe suis intéressé(e) par le bien suivant :\n\n📍 ${titreBien}\n🏠 Type: ${typeBien}\n📌 Ville: ${ville}\n\nPourriez-vous me donner plus d'informations?\n\nMerci!`;
    const numeroWhatsApp = '216842320';
    const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

// ===== ENVOYER MESSAGE CONTACT =====
function envoyerMessage(event) {
    event.preventDefault();
    
    const nom = document.getElementById('contactNom').value;
    const tel = document.getElementById('contactTel').value;
    const email = document.getElementById('contactEmail').value;
    const objet = document.getElementById('contactObjet').value;
    const message = document.getElementById('contactMessage').value;
    
    const messageWhatsApp = `📧 NOUVEAU MESSAGE DU SITE\n\n👤 Nom: ${nom}\n📞 Tél: ${tel}\n📧 Email: ${email}\n📋 Objet: ${objet}\n\n💬 Message:\n${message}`;
    
    const url = `https://wa.me/216842320?text=${encodeURIComponent(messageWhatsApp)}`;
    window.open(url, '_blank');
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message-success';
    messageDiv.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 1.5rem 2rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 9999;
    `;
    messageDiv.innerHTML = '✅ Message envoyé! Nous vous recontacterons très bientôt.';
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
    
    event.target.reset();
}

// ===== MODAL SERVICES =====
function ouvrirServiceModal(service) {
    const modal = document.getElementById('serviceModal');
    const modalBody = document.getElementById('modalBody');
    
    const servicesContent = {
        vente: {
            icon: '🏡',
            titre: 'Service de Vente Immobilière',
            description: 'Vendez votre bien immobilier rapidement et au meilleur prix avec notre accompagnement professionnel complet.',
            details: [
                'Estimation gratuite et précise de votre bien',
                'Photos professionnelles et visite virtuelle',
                'Diffusion sur tous nos canaux (site web, réseaux sociaux, partenaires)',
                'Organisation des visites et sélection des acheteurs',
                'Négociation et accompagnement juridique',
                'Suivi jusqu\'à la signature définitive'
            ],
            avantages: [
                '✓ Vente rapide grâce à notre réseau étendu',
                '✓ Prix optimisé grâce à notre connaissance du marché',
                '✓ Accompagnement de A à Z',
                '✓ Pas de frais cachés'
            ]
        },
        location: {
            icon: '🔑',
            titre: 'Service de Location & Gestion Locative',
            description: 'Trouvez le locataire idéal et confiez-nous la gestion complète de votre bien en location.',
            details: [
                'Recherche et sélection rigoureuse des locataires',
                'Vérification des dossiers et garanties',
                'Rédaction du contrat de bail conforme',
                'État des lieux d\'entrée et de sortie',
                'Gestion des loyers et charges',
                'Maintenance et interventions'
            ],
            avantages: [
                '✓ Locataires solvables et fiables',
                '✓ Gestion sans stress',
                '✓ Respect de la législation',
                '✓ Disponibilité 7j/7'
            ]
        },
        estimation: {
            icon: '📊',
            titre: 'Estimation Immobilière Gratuite',
            description: 'Obtenez une évaluation précise et gratuite de votre bien immobilier par nos experts.',
            details: [
                'Analyse approfondie du marché local',
                'Visite complète de votre bien',
                'Étude comparative des biens similaires',
                'Prise en compte des spécificités et avantages',
                'Rapport d\'estimation détaillé',
                'Conseils personnalisés pour optimiser la valeur'
            ],
            avantages: [
                '✓ Estimation 100% gratuite et sans engagement',
                '✓ Expertise reconnue du marché tunisien',
                '✓ Rapport détaillé sous 48h',
                '✓ Conseils pour améliorer la valeur'
            ]
        },
        conseil: {
            icon: '💼',
            titre: 'Conseil & Expertise Immobilière',
            description: 'Bénéficiez de notre expertise pour tous vos projets immobiliers : achat, vente, investissement.',
            details: [
                'Étude de marché personnalisée',
                'Stratégie d\'investissement locatif',
                'Aide au montage financier',
                'Optimisation fiscale',
                'Conseil en gestion patrimoniale',
                'Accompagnement sur mesure'
            ],
            avantages: [
                '✓ Expertise locale approfondie',
                '✓ Réseau de partenaires (notaires, banques)',
                '✓ Conseils neutres et objectifs',
                '✓ Stratégies gagnantes'
            ]
        }
    };
    
    const content = servicesContent[service];
    
    modalBody.innerHTML = `
        <div class="modal-header">
            <div class="modal-icon">${content.icon}</div>
        </div>
        <div class="modal-body">
            <h3>${content.titre}</h3>
            <p>${content.description}</p>
            
            <div class="modal-features">
                <h4>📋 Notre service comprend :</h4>
                <ul>
                    ${content.details.map(detail => `<li>• ${detail}</li>`).join('')}
                </ul>
            </div>
            
            <div class="modal-features">
                <h4>⭐ Vos avantages :</h4>
                <ul>
                    ${content.avantages.map(avantage => `<li>${avantage}</li>`).join('')}
                </ul>
            </div>
            
            <button class="modal-cta" onclick="contacterPourService('${service}')">
                📱 Contactez-nous pour ce service
            </button>
        </div>
    `;
    
    modal.style.display = 'block';
}

function fermerServiceModal() {
    document.getElementById('serviceModal').style.display = 'none';
}

function contacterPourService(service) {
    const servicesNoms = {
        vente: 'Service de Vente',
        location: 'Service de Location',
        estimation: 'Estimation Gratuite',
        conseil: 'Conseil Immobilier'
    };
    
    const message = `Bonjour,\n\nJe suis intéressé(e) par votre service : ${servicesNoms[service]}\n\nPourriez-vous me contacter?\n\nMerci!`;
    const url = `https://wa.me/216842320?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    fermerServiceModal();
}

// Fermer modal en cliquant à l'extérieur
window.onclick = function(event) {
    const modal = document.getElementById('serviceModal');
    if (event.target == modal) {
        fermerServiceModal();
    }
}

// ===== STATISTIQUES ADMIN =====
function mettreAJourStats() {
    const totalBiens = document.getElementById('totalBiens');
    const totalVente = document.getElementById('totalVente');
    const totalLocation = document.getElementById('totalLocation');
    const valeurTotale = document.getElementById('valeurTotale');
    
    if (totalBiens) {
        totalBiens.textContent = biens.length;
    }
    
    if (totalVente) {
        const ventes = biens.filter(b => b.transaction === 'vente').length;
        totalVente.textContent = ventes;
    }
    
    if (totalLocation) {
        const locations = biens.filter(b => b.transaction === 'location').length;
        totalLocation.textContent = locations;
    }
    
    if (valeurTotale) {
        const valeur = biens
            .filter(b => b.transaction === 'vente')
            .reduce((sum, b) => sum + parseInt(b.prix || 0), 0);
        valeurTotale.textContent = valeur.toLocaleString('fr-TN');
    }
}

// ===== EXPORTER LES BIENS =====
function exporterBiens() {
    const dataStr = JSON.stringify(biens, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `biens_immobiliers_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
}

// ===== SCROLL TO TOP =====
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Afficher/masquer bouton scroll
window.addEventListener('scroll', () => {
    const scrollBtn = document.getElementById('scrollTop');
    if (scrollBtn) {
        if (window.pageYOffset > 300) {
            scrollBtn.classList.add('visible');
        } else {
            scrollBtn.classList.remove('visible');
        }
    }
});

// ===== MENU MOBILE =====
function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    navMenu.classList.toggle('mobile-active');
}

// ===== CHARGER AU DÉMARRAGE =====
window.addEventListener('load', () => {
    afficherBiens();
    
    // Ajouter des biens d'exemple si vide
    if (biens.length === 0) {
        biens = [
            {
                id: 1,
                titre: "Magnifique Villa avec Piscine",
                type: "villa",
                transaction: "vente",
                prix: "450000",
                superficie: "350",
                chambres: "5",
                sallesBain: "3",
                etages: "2",
                annee: "2022",
                parking: "oui",
                ville: "Tunis",
                quartier: "La Marsa",
                adresse: "Avenue Habib Bourguiba",
                description: "Superbe villa moderne avec piscine, jardin paysager et vue mer. Finitions haut de gamme, cuisine équipée, climatisation dans toutes les pièces. Quartier calme et résidentiel.",
                image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600",
                imagesSupp: "",
                equipements: ["Piscine", "Jardin", "Climatisation", "Chauffage", "Sécurité"],
                dateAjout: new Date().toLocaleDateString('fr-TN')
            },
            {
                id: 2,
                titre: "Appartement Standing S+3",
                type: "appartement",
                transaction: "location",
                prix: "1200",
                superficie: "140",
                chambres: "3",
                sallesBain: "2",
                etages: "5",
                annee: "2021",
                parking: "oui",
                ville: "Sousse",
                quartier: "Sahloul",
                adresse: "Résidence Jasmin, 5ème étage",
                description: "Bel appartement meublé dans résidence moderne avec ascenseur, parking et sécurité 24h/24. Proche de toutes commodités.",
                image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600",
                imagesSupp: "",
                equipements: ["Meublé", "Ascenseur", "Sécurité", "Climatisation"],
                dateAjout: new Date().toLocaleDateString('fr-TN')
            },
            {
                id: 3,
                titre: "Terrain Constructible 500m²",
                type: "terrain",
                transaction: "vente",
                prix: "180000",
                superficie: "500",
                chambres: "",
                sallesBain: "",
                etages: "",
                annee: "",
                parking: "non",
                ville: "Hammamet",
                quartier: "Yasmine",
                adresse: "Zone touristique",
                description: "Terrain constructible bien situé dans zone recherchée d'Hammamet. Titre bleu, toutes commodités à proximité. Idéal pour construction villa ou projet commercial.",
                image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600",
                imagesSupp: "",
                equipements: [],
                dateAjout: new Date().toLocaleDateString('fr-TN')
            }
        ];
        sauvegarderBiens();
        afficherBiens();
    }
});

// Animation au scroll
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, {
    threshold: 0.1
});

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.bien-card, .service-card, .testimonial-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.5s ease-out';
        observer.observe(el);
    });
});