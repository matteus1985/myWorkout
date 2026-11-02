/* UI translation infrastructure. Unlisted text stays unchanged. */
(() => {
  'use strict';
  const entries = {
    'Lift Log':['Lift Log','Lift Log','Lift Log'], 'Lift Log — Workout tracker':['Lift Log — Diario di allenamento','Lift Log — Journal d’entraînement','Lift Log — Trainingstagebuch'],
    'Lift Log tutorial':['Tutorial Lift Log','Tutoriel Lift Log','Lift Log Anleitung'], 'Train. Track. Improve.':['Allenati. Registra. Migliora.','Entraînez-vous. Suivez. Progressez.','Trainieren. Erfassen. Verbessern.'],
    'UP NEXT':['PROSSIMO ALLENAMENTO','PROCHAIN ENTRAÎNEMENT','ALS NÄCHSTES'], 'AI plan needed':['Serve un programma AI','Programme IA nécessaire','KI-Trainingsplan erforderlich'],
    'Choose level':['Scegli il livello','Choisir le niveau','Niveau auswählen'],
    'Choose your experience level':['Scegli il tuo livello di esperienza','Choisissez votre niveau d’expérience','Wähle dein Erfahrungsniveau'],
    'Your level helps us choose appropriate exercises. Your logged weights do not determine it.':['Il tuo livello ci aiuta a scegliere esercizi adatti. Non dipende dai pesi registrati.','Votre niveau nous aide à choisir des exercices adaptés. Il ne dépend pas des charges enregistrées.','Dein Niveau hilft uns, passende Übungen auszuwählen. Es hängt nicht von deinen eingetragenen Gewichten ab.'],
    'sets logged this week':['serie registrate questa settimana','séries enregistrées cette semaine','Sätze diese Woche'],
    'Generate AI plan':['Genera programma AI','Créer un programme avec l’IA','KI-Trainingsplan erstellen'],
    'Start workout →':['Inizia allenamento →','Commencer l’entraînement →','Training starten →'], 'Resume workout →':['Riprendi allenamento →','Reprendre l’entraînement →','Training fortsetzen →'],
    'Partial':['Parziale','Partiel','Teilweise'],
    'Add age, height and current weight to estimate daily energy needs.':['Aggiungi età, altezza e peso attuale per stimare il fabbisogno energetico.','Ajoutez votre âge, taille et poids pour estimer vos besoins énergétiques.','Gib Alter, Grösse und aktuelles Gewicht ein, um deinen Energiebedarf zu schätzen.'],
    'Macro targets will appear after you save your profile.':['Gli obiettivi dei macronutrienti appariranno dopo aver salvato il profilo.','Les objectifs de macronutriments apparaîtront après l’enregistrement du profil.','Die Makronährstoffziele erscheinen nach dem Speichern deines Profils.'],
    'Chest':['Pettorali','Pectoraux','Brust'], 'Back':['Schiena','Dos','Rücken'], 'Core':['Addome','Tronc','Rumpf'], 'Abs':['Addominali','Abdominaux','Bauch'], 'Shoulders':['Spalle','Épaules','Schultern'],
    'Front delts':['Deltoidi anteriori','Deltoïdes avant','Vordere Schultern'], 'Side delts':['Deltoidi laterali','Deltoïdes latéraux','Seitliche Schultern'], 'Rear delts':['Deltoidi posteriori','Deltoïdes arrière','Hintere Schultern'],
    'Upper traps':['Trapezi superiori','Trapèzes supérieurs','Oberer Trapezmuskel'], 'Traps':['Trapezi','Trapèzes','Trapezmuskel'], 'Forearms':['Avambracci','Avant-bras','Unterarme'],
    'Biceps':['Bicipiti','Biceps','Bizeps'], 'Triceps':['Tricipiti','Triceps','Trizeps'], 'Glutes':['Glutei','Fessiers','Gesäss'], 'Hamstrings':['Femorali','Ischio-jambiers','Beinbeuger'],
    'Quadriceps':['Quadricipiti','Quadriceps','Quadrizeps'], 'Calves':['Polpacci','Mollets','Waden'], 'Adductors':['Adduttori','Adducteurs','Adduktoren'],
    'Bands':['Elastici','Élastiques','Bänder'], 'Barbells':['Bilancieri','Barres','Langhanteln'], 'Dumbbells':['Manubri','Haltères','Kurzhanteln'], 'Bodyweight':['Corpo libero','Poids du corps','Körpergewicht'], 'Cables':['Cavi','Poulies','Kabelzug'], 'Machines':['Macchine','Machines','Maschinen'], 'Smith machine':['Multipower','Cadre guidé','Smith-Maschine'], 'Special equipment':['Attrezzatura speciale','Équipement spécial','Spezialgeräte'],
    'beginner':['principiante','débutant','Anfänger'], 'intermediate':['intermedio','intermédiaire','Fortgeschritten'], 'advanced':['avanzato','avancé','Sehr erfahren'],
    'Search exercises':['Cerca esercizi','Rechercher des exercices','Übungen suchen'], 'Filter muscle':['Filtra per muscolo','Filtrer par muscle','Nach Muskel filtern'], 'Filter equipment':['Filtra per attrezzatura','Filtrer par équipement','Nach Ausstattung filtern'], 'Filter difficulty':['Filtra per livello','Filtrer par niveau','Nach Niveau filtern'],
    'Band Good Morning':['Good morning con elastico','Good morning avec élastique','Good Morning mit Band'], 'Donkey Calf Raise Machine':['Calf raise donkey alla macchina','Mollets à la machine en position donkey','Donkey Wadenheben an der Maschine'], 'Bodyweight Step-Up':['Step-up a corpo libero','Step-up au poids du corps','Step-up mit Körpergewicht'], 'Cable Curl':['Curl ai cavi','Curl à la poulie','Kabelcurl'], 'Bird Dog':['Bird dog','Bird dog','Bird Dog'], 'Dead Bug':['Dead bug','Dead bug','Dead Bug'],
    'Assisted Dip Machine':['Dip alla macchina assistita','Dips à la machine assistée','Assistierte Dips an der Maschine'], 'Assisted Pull-Up Machine':['Trazioni alla macchina assistita','Tractions à la machine assistée','Assistierte Klimmzüge an der Maschine'],
    'Band Chest Fly':['Croci con elastico','Écartés avec élastique','Brust-Flys mit Band'], 'Band Chest Press':['Distensioni per il petto con elastico','Développé poitrine avec élastique','Brustdrücken mit Band'],
    'Band Curl':['Curl con elastico','Curl avec élastique','Bizepscurl mit Band'], 'Band Crunch':['Crunch con elastico','Crunch avec élastique','Crunch mit Band'],
    'Band Face Pull':['Face pull con elastico','Face pull avec élastique','Face Pull mit Band'], 'Band Row':['Rematore con elastico','Tirage avec élastique','Rudern mit Band'],
    'Band Pull-Apart':['Aperture con elastico','Écartés avec élastique','Band Pull-Aparts'], 'Band-Assisted Dip':['Dip con elastico','Dips assistés par élastique','Dips mit Bandunterstützung'],
    'Band-Assisted Pull-Up':['Trazioni con elastico','Tractions assistées par élastique','Klimmzüge mit Bandunterstützung'], 'Cable Pull-Through':['Pull-through ai cavi','Pull-through à la poulie','Kabel-Pull-through'],
    'Underhand Lat Pulldown':['Lat machine con presa supina','Tirage vertical en supination','Latzug im Untergriff'], 'archer pull up':['Trazione archer','Traction archer','Archer-Klimmzug'],
    'Seated Cable Row':['Rematore ai cavi da seduto','Tirage horizontal assis à la poulie','Kabelrudern im Sitzen'], 'Band Lat Pulldown':['Lat pulldown con elastico','Tirage vertical avec élastique','Latzug mit Band'],
    'Band Straight-Arm Pulldown':['Pulldown a braccia tese con elastico','Tirage bras tendus avec élastique','Gestreckter Latzug mit Band'],
    'Your schedule will be built from your profile and training history.':['Il programma sarà creato in base al tuo profilo e alla cronologia degli allenamenti.','Le programme sera créé à partir de votre profil et de vos entraînements.','Der Plan wird anhand deines Profils und deiner Trainingshistorie erstellt.'],
    'Language':['Lingua','Langue','Sprache'], 'Settings':['Impostazioni','Paramètres','Einstellungen'],
    'Workouts':['Allenamenti','Entraînements','Training'], 'Progress':['Progressi','Progrès','Fortschritt'], 'Nutrition':['Nutrizione','Nutrition','Ernährung'],
    'Your app, your pace':['La tua app, il tuo ritmo','Votre application, votre rythme','Deine App, dein Tempo'],
    'Personalize your training, nutrition and data.':['Personalizza allenamento, nutrizione e dati.','Personnalisez votre entraînement, votre nutrition et vos données.','Personalisiere Training, Ernährung und Daten.'],
    'Nutrition profile':['Profilo nutrizionale','Profil nutritionnel','Ernährungsprofil'], 'Daily targets and weight goals':['Obiettivi giornalieri e di peso','Objectifs quotidiens et de poids','Tages- und Gewichtsziele'],
    'Your training plan':['Il tuo programma','Votre programme','Dein Trainingsplan'], 'Schedule, experience and equipment':['Frequenza, esperienza e attrezzatura','Fréquence, expérience et équipement','Häufigkeit, Erfahrung und Ausstattung'],
    'Exercise catalogue':['Catalogo esercizi','Catalogue des exercices','Übungskatalog'], 'Backup & restore':['Backup e ripristino','Sauvegarde et restauration','Sicherung und Wiederherstellung'],
    'App tutorial':['Tutorial dell’app','Tutoriel de l’application','App-Anleitung'], 'Review the basics and your setup':['Rivedi le basi e la configurazione','Revoir les bases et la configuration','Grundlagen und Einrichtung ansehen'],
    'AI setup':['Configurazione AI','Configuration IA','KI-Einrichtung'], 'Enter your private code to enable AI features.':['Inserisci il codice privato per attivare le funzioni AI.','Saisissez votre code privé pour activer les fonctions IA.','Gib deinen privaten Code ein, um KI-Funktionen zu aktivieren.'],
    'Private code':['Codice privato','Code privé','Privater Code'], 'Save setup':['Salva configurazione','Enregistrer','Einstellungen speichern'], 'Test connection':['Verifica connessione','Tester la connexion','Verbindung testen'],
    'Age':['Età','Âge','Alter'], 'Height':['Altezza','Taille','Grösse'], 'Years':['Anni','Ans','Jahre'], 'Current weight':['Peso attuale','Poids actuel','Aktuelles Gewicht'], 'Goal weight':['Peso obiettivo','Poids cible','Zielgewicht'],
    'Activity level':['Livello di attività','Niveau d’activité','Aktivitätsniveau'], 'Mostly sitting':['Prevalentemente sedentario','Principalement assis','Überwiegend sitzend'], 'Light activity':['Attività leggera','Activité légère','Leichte Aktivität'], 'Moderate activity':['Attività moderata','Activité modérée','Mässige Aktivität'], 'Very active':['Molto attivo','Très actif','Sehr aktiv'],
    'Formula setting':['Formula di calcolo','Formule de calcul','Berechnungsformel'], 'Neutral estimate':['Stima neutra','Estimation neutre','Neutrale Schätzung'], 'Female coefficient':['Coefficiente femminile','Coefficient féminin','Weiblicher Koeffizient'], 'Male coefficient':['Coefficiente maschile','Coefficient masculin','Männlicher Koeffizient'],
    'Save nutrition profile':['Salva profilo nutrizionale','Enregistrer le profil nutritionnel','Ernährungsprofil speichern'], 'Save calorie target':['Salva obiettivo calorico','Enregistrer l’objectif calorique','Kalorienziel speichern'],
    'Workouts per week':['Allenamenti a settimana','Entraînements par semaine','Trainings pro Woche'], 'Experience level':['Livello di esperienza','Niveau d’expérience','Erfahrungsniveau'], 'Choose your level':['Scegli il tuo livello','Choisissez votre niveau','Wähle dein Niveau'],
    'Beginner':['Principiante','Débutant','Anfänger'], 'Intermediate':['Intermedio','Intermédiaire','Fortgeschritten'], 'Advanced':['Avanzato','Avancé','Sehr erfahren'], 'Available equipment':['Attrezzatura disponibile','Équipement disponible','Verfügbare Ausstattung'],
    'Update plan':['Aggiorna programma','Actualiser le programme','Trainingsplan aktualisieren'], 'Export Backup':['Esporta backup','Exporter la sauvegarde','Sicherung exportieren'], 'Import Backup':['Importa backup','Importer la sauvegarde','Sicherung importieren'], 'Save or restore your app data.':['Salva o ripristina i dati dell’app.','Sauvegardez ou restaurez les données de l’application.','App-Daten sichern oder wiederherstellen.'],
    'Welcome to Lift Log':['Benvenuto in Lift Log','Bienvenue dans Lift Log','Willkommen bei Lift Log'], 'Follow your workouts, log your meals and track your progress in one place.':['Segui i tuoi allenamenti, registra i pasti e controlla i progressi in un unico posto.','Suivez vos entraînements, vos repas et vos progrès au même endroit.','Verfolge Training, Mahlzeiten und Fortschritte an einem Ort.'],
    'Workouts & progress':['Allenamenti e progressi','Entraînements et progrès','Training und Fortschritt'], 'Your training':['Il tuo allenamento','Votre entraînement','Dein Training'], 'Enable AI':['Attiva AI','Activer l’IA','KI aktivieren'],
    'Next':['Avanti','Suivant','Weiter'], 'Back':['Indietro','Retour','Zurück'], 'Skip':['Salta','Passer','Überspringen'], 'Finish':['Fine','Terminer','Fertig'], 'Show':['Mostra','Afficher','Anzeigen'], 'Hide':['Nascondi','Masquer','Ausblenden'],
    'Your plan':['Il tuo programma','Votre programme','Dein Trainingsplan'], 'End week':['Termina settimana','Terminer la semaine','Woche abschliessen'], 'Weekly training volume':['Volume settimanale','Volume hebdomadaire','Wöchentliches Trainingsvolumen'],
    'Food diary':['Diario alimentare','Journal alimentaire','Ernährungstagebuch'], 'Add a meal':['Aggiungi un pasto','Ajouter un repas','Mahlzeit hinzufügen'], 'Save meal':['Salva pasto','Enregistrer le repas','Mahlzeit speichern'], 'Scan food':['Scansiona alimento','Scanner un aliment','Lebensmittel scannen'],
    'Muscle map':['Mappa muscolare','Carte musculaire','Muskelkarte'], 'Training volume trend':['Andamento del volume','Évolution du volume','Trainingsvolumen im Verlauf'], 'Training rhythm':['Ritmo di allenamento','Rythme d’entraînement','Trainingsrhythmus'],
    'Cancel':['Annulla','Annuler','Abbrechen'], 'Save':['Salva','Enregistrer','Speichern'], 'Close':['Chiudi','Fermer','Schliessen'], 'Try again':['Riprova','Réessayer','Erneut versuchen']
  };
  Object.assign(entries,{
'Next week notes (optional)':['Indicazioni per la prossima settimana (facoltativo)','Consignes pour la semaine prochaine (facultatif)','Hinweise für nächste Woche (optional)'],
'Notes for your next training week':['Indicazioni per il prossimo programma','Consignes pour votre prochain programme','Hinweise für deinen nächsten Trainingsplan'],
    'Chest-Supported Row':['Rematore con il petto appoggiato','Rowing avec appui poitrine','Brustgestütztes Rudern'],
    'Chest-Supported T-Bar Row':['Rematore con barra a T e petto appoggiato','Rowing barre en T avec appui poitrine','Brustgestütztes T-Bar-Rudern'],
    'Chest-Supported Dumbbell Row':['Rematore con manubri e petto appoggiato','Rowing avec haltères et appui poitrine','Brustgestütztes Kurzhantelrudern'],
    'Barbell Row':['Rematore con bilanciere','Rowing avec barre','Langhantelrudern'],
    'Inverted Row':['Rematore inverso','Rowing inversé','Umgekehrtes Rudern'],
    'Band Row':['Rematore con elastico','Rowing avec élastique','Rudern mit Band'],
    'Single-Arm Machine Row':['Rematore alla macchina a un braccio','Rowing à la machine à un bras','Einarmiges Maschinenrudern'],
    'Seal Row':['Rematore su panca con petto appoggiato','Seal row avec appui poitrine','Seal Row mit Brustauflage'],
    'Pendlay Row':['Rematore Pendlay','Rowing Pendlay','Pendlay-Rudern'],
    'Meadows Row':['Rematore Meadows','Rowing Meadows','Meadows-Rudern'],
    'Landmine Row':['Rematore landmine','Rowing landmine','Landmine-Rudern'],
    'Single-Arm Cable Row':['Rematore ai cavi a un braccio','Rowing à la poulie à un bras','Einarmiges Kabelrudern'],
    'Ring Row':['Rematore agli anelli','Rowing aux anneaux','Ringrudern'],
    'Kneeling Cable Row':['Rematore ai cavi in ginocchio','Rowing à la poulie à genoux','Kniendes Kabelrudern'],
    'Wide-Grip Seated Cable Row':['Rematore ai cavi da seduto a presa larga','Rowing assis à la poulie avec prise large','Sitzendes Kabelrudern mit breitem Griff'],
    'Underhand Barbell Row':['Rematore con bilanciere a presa supina','Rowing barre en prise supination','Langhantelrudern im Untergriff'],
    'Cable Rope Upright Row':['Tirata al mento ai cavi con corda','Tirage menton à la poulie avec corde','Aufrechtes Rudern am Kabel mit Seil'],
    'Dumbbell Upright Row':['Tirata al mento con manubri','Tirage menton avec haltères','Aufrechtes Rudern mit Kurzhanteln'],
    'Wide-Grip Barbell Upright Row':['Tirata al mento con bilanciere a presa larga','Tirage menton à la barre avec prise large','Aufrechtes Langhantelrudern mit weitem Griff'],
    'Wide-Grip Cable Upright Row':['Tirata al mento ai cavi a presa larga','Tirage menton à la poulie avec prise large','Aufrechtes Rudern am Kabel mit breitem Griff'],
    'Band Upright Row':['Tirata al mento con elastico','Tirage menton avec élastique','Aufrechtes Rudern mit Band'],
    'Smith Machine Upright Row':['Tirata al mento alla Smith machine','Tirage menton à la Smith machine','Aufrechtes Rudern an der Smith-Maschine'],
    'Single-Arm Cable Upright Row':['Tirata al mento ai cavi a un braccio','Tirage menton à la poulie à un bras','Einarmiges aufrechtes Rudern am Kabel'],
    'Rest timer':['Timer','Timer','Timer'], 'Rest time':['Tempo di recupero','Temps de récupération','Pausenzeit'],
    'Back to workouts':['Torna agli allenamenti','Retour aux entraînements','Zurück zum Training'],
    'Finish workout':['Termina allenamento','Terminer l’entraînement','Training beenden'], 'Workout completed':['Allenamento completato','Entraînement terminé','Training abgeschlossen'],
    'Decrease rest duration by 10 seconds':['Riduci il recupero di 10 secondi','Réduire la pause de 10 secondes','Pause um 10 Sekunden verkürzen'],
    'Increase rest duration by 10 seconds':['Aumenta il recupero di 10 secondi','Augmenter la pause de 10 secondes','Pause um 10 Sekunden verlängern'],
    'Decrease rest duration':['Riduci il recupero','Réduire la pause','Pause verkürzen'], 'Increase rest duration':['Aumenta il recupero','Augmenter la pause','Pause verlängern'],
    'Start rest':['Avvia il timer','Démarrer le timer','Timer starten'],
    'Remove exercise':['Rimuovi esercizio','Supprimer l’exercice','Übung entfernen'], 'Choose alternative':['Scegli alternativa','Choisir une alternative','Alternative auswählen'],
    'Rest':['Recupero','Récupération','Pause'], 'Rest ready':['Timer pronto','Timer prêt','Timer bereit'],
    'Rest complete':['Recupero terminato','Récupération terminée','Pause beendet'], 'Rest complete.':['Recupero terminato.','Récupération terminée.','Pause beendet.'],
    'Ready':['Pronto','Prêt','Bereit'],
    'Workout complete':['Allenamento completato','Entraînement terminé','Training abgeschlossen'], 'Tap Finish to save':['Premi Fine per salvare','Appuyez sur Terminer pour enregistrer','Zum Speichern auf Fertig tippen'],
    'Start rest timer':['Avvia timer di recupero','Démarrer le timer de récupération','Pausen-Timer starten'], 'Cancel rest timer':['Annulla timer di recupero','Annuler le timer de récupération','Pausen-Timer abbrechen'],
    'Pause workout timer':['Metti in pausa il timer dell’allenamento','Mettre le timer d’entraînement en pause','Trainingstimer pausieren'],
    'Resume workout timer':['Riprendi il timer dell’allenamento','Reprendre le timer d’entraînement','Trainingstimer fortsetzen'],
    'Workout elapsed time':['Tempo trascorso','Temps écoulé','Verstrichene Trainingszeit'],
    'Set':['Serie','Série','Satz'], 'Weight · kg':['Peso · kg','Poids · kg','Gewicht · kg'], 'Reps':['Ripetizioni','Répétitions','Wiederholungen'],
    'Seconds':['Secondi','Secondes','Sekunden'], 'Reps left':['Reps in riserva','Rép. en réserve','Wdh. in Reserve'],
    '(optional)':['(facoltativo)','(facultatif)','(optional)'],
    'Decrease weight':['Riduci peso','Réduire le poids','Gewicht reduzieren'], 'Increase weight':['Aumenta peso','Augmenter le poids','Gewicht erhöhen'],
    'Decrease reps':['Riduci ripetizioni','Réduire les répétitions','Wiederholungen reduzieren'], 'Increase reps':['Aumenta ripetizioni','Augmenter les répétitions','Wiederholungen erhöhen'],
    'Mark set incomplete':['Segna la serie come incompleta','Marquer la série comme incomplète','Satz als unvollständig markieren'], 'Mark set complete':['Segna la serie come completata','Marquer la série comme terminée','Satz als abgeschlossen markieren'],
    'Optional drop set · use a lighter load and stop with 0–1 reps in reserve':['Drop set facoltativo · riduci il peso e fermati con 0–1 reps in riserva','Drop set facultatif · réduisez la charge et gardez 0–1 répétition en réserve','Optionaler Drop-Satz · Gewicht reduzieren und mit 0–1 Wiederholungen in Reserve stoppen'],
    'Mark optional drop set complete':['Segna il drop set come completato','Marquer le drop set comme terminé','Optionalen Drop-Satz als abgeschlossen markieren']
  });
  const nodes = new WeakMap(), attrs = new WeakMap();
  let language = 'en';
  const translate = text => {
    if(language==='en')return text;
    const index=['it','fr','de'].indexOf(language), values=entries[text];
    if(values?.[index])return values[index];
    let setMatch=text.match(/^Set (\d+) weight in kilograms$/);
    if(setMatch)return ['Serie '+setMatch[1]+': peso in chilogrammi','Série '+setMatch[1]+' : poids en kilogrammes','Satz '+setMatch[1]+': Gewicht in Kilogramm'][index];
    setMatch=text.match(/^Set (\d+) (reps|seconds)$/);
    if(setMatch){const unit=setMatch[2]==='reps'?['ripetizioni','répétitions','Wiederholungen']:['secondi','secondes','Sekunden'];return ['Serie '+setMatch[1]+': ','Série '+setMatch[1]+' : ','Satz '+setMatch[1]+': '][index]+unit[index];}
    let foldMatch=text.match(/^(Expand|Collapse) (.+)$/);
    if(foldMatch)return (foldMatch[1]==='Expand'?['Espandi ','Développer ','Aufklappen: ']:['Chiudi ','Réduire ','Zuklappen: '])[index]+translate(foldMatch[2]);
    const exerciseAction=text.match(/^(Enlarge (.+) image|Guide for (.+)|How to do (.+)|Remove (.+)|Choose an alternative for (.+))$/);
    if(exerciseAction){const name=translate(exerciseAction.slice(2).find(Boolean));
      if(exerciseAction[2])return ['Ingrandisci immagine: ','Agrandir l’image : ','Bild vergrössern: '][index]+name;
      if(exerciseAction[3]||exerciseAction[4])return ['Guida: ','Guide : ','Anleitung: '][index]+name;
      if(exerciseAction[5])return ['Rimuovi ','Supprimer ','Entfernen: '][index]+name;
      return ['Scegli un’alternativa per ','Choisir une alternative pour ','Alternative auswählen für '][index]+name;
    }
    let match=text.match(/^(\d+) illustrated exercises$/);
    if(match)return [match[1]+' esercizi illustrati',match[1]+' exercices illustrés',match[1]+' illustrierte Übungen'][index];
    match=text.match(/^(\d+) exercises found$/);
    if(match)return [match[1]+' esercizi trovati',match[1]+' exercices trouvés',match[1]+' Übungen gefunden'][index];
    match=text.match(/^(\d+) days · (.+)$/);
    if(match){const count=Number(match[1]);return [match[1]+(count===1?' giorno · ':' giorni · ')+translate(match[2]),match[1]+(count===1?' jour · ':' jours · ')+translate(match[2]),match[1]+(count===1?' Tag · ':' Tage · ')+translate(match[2])][index];}
    match=text.match(/^(\d+) exercises · about (\d+) minutes$/);
    if(match){const count=Number(match[1]);return [match[1]+(count===1?' esercizio':' esercizi')+' · circa '+match[2]+' minuti',match[1]+(count===1?' exercice':' exercices')+' · environ '+match[2]+' minutes',match[1]+(count===1?' Übung':' Übungen')+' · etwa '+match[2]+' Minuten'][index];}
    match=text.match(/^(\d+) exercises · (\d+) min · (\d+)\/(\d+) sets logged$/);
    if(match){const count=Number(match[1]);return [match[1]+(count===1?' esercizio':' esercizi')+' · '+match[2]+' min · '+match[3]+'/'+match[4]+' serie',match[1]+(count===1?' exercice':' exercices')+' · '+match[2]+' min · '+match[3]+'/'+match[4]+' séries',match[1]+(count===1?' Übung':' Übungen')+' · '+match[2]+' Min. · '+match[3]+'/'+match[4]+' Sätze'][index];}
    match=text.match(/^Last backup export: (.+?)( · Please back up this week)?$/);
    if(match){const date=match[1]==='Never'?['Mai','Jamais','Nie'][index]:match[1];return ["Ultimo backup: ",'Dernière sauvegarde : ','Letzte Sicherung: '][index]+date+(match[2]?[' · Esegui un backup questa settimana',' · Faites une sauvegarde cette semaine',' · Erstelle diese Woche eine Sicherung'][index]:'');}
    return window.LIFT_I18N_DATA?.[language]?.[text] || text;
  };
  function apply(root=document.body){
    if(!root)return;
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    while(walker.nextNode()){
      const node=walker.currentNode, parent=node.parentElement;
      if(!parent || parent.closest('script,style,textarea,[data-i18n-user-content],#nutrition-meals,#meal-draft-list,#nutrition-favorites,#last-workout-comment,#progress-ai-content,#workout-ai-result,#exercise-list,#catalogue-list,#alternative-list,#day-list,#food-results,#nutrition-coach-result'))continue;
      if(!nodes.has(node))nodes.set(node,node.nodeValue);
      const original=nodes.get(node), trimmed=original.trim();
      if(parent.tagName==='OPTION' && !parent.hasAttribute('value'))parent.setAttribute('value',trimmed);
      if(trimmed){const value=original.replace(trimmed,parent.closest('#catalogue-muscle,#alternative-muscle,#priority-muscles,#lower-focus-muscles,#muscle-map-chart')?translateMuscle(trimmed):translate(trimmed));if(node.nodeValue!==value)node.nodeValue=value;}
    }
    const elements=[...(root.matches?.('[aria-label],[title],[placeholder]')?[root]:[]),...root.querySelectorAll('[aria-label],[title],[placeholder]')];
    for(const el of elements){if(el.closest('[data-i18n-user-content],#nutrition-meals,#meal-draft-list,#nutrition-favorites,#last-workout-comment,#progress-ai-content,#exercise-list,#catalogue-list,#alternative-list'))continue;let saved=attrs.get(el);if(!saved){saved={};attrs.set(el,saved);}for(const name of ['aria-label','title','placeholder']){if(!el.hasAttribute(name))continue;const current=el.getAttribute(name);let item=saved[name];if(!item||current!==item.last){item={original:current,last:current};saved[name]=item;}const value=translate(item.original);if(current!==value)el.setAttribute(name,value);item.last=value;}}
  }
  function translateMuscle(text){if(text==='Back'&&language!=='en')return {it:'Schiena',fr:'Dos',de:'Rücken'}[language];return translate(text);}
  window.LiftI18n={apply,translate,translateMuscle,setLanguage(value){language=['en','it','fr','de'].includes(value)?value:'en';document.documentElement.lang=language;apply();},get language(){return language;}};
  if(typeof MutationObserver!=='undefined'){
    const pending=new Set();let queued=false;new MutationObserver(records=>{if(language==='en')return;for(const record of records)if(record.target?.nodeType===1)pending.add(record.target);if(queued||!pending.size)return;queued=true;queueMicrotask(()=>{queued=false;const roots=[...pending];pending.clear();for(const root of roots)if(root.isConnected)apply(root);});}).observe(document.body,{childList:true,subtree:true});
  }
})();
