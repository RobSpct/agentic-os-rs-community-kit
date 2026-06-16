# Scoring-Rubrics (projekt-relativ)

Jede Achse 0-100. Höher = stärkere Bedrohung für das Projekt auf dieser Achse.
"das Projekt" = das in config.json hinterlegte Projekt (projectName/projectPurpose).

## Achse: nische (Nischen-Overlap)
Wie stark zielt der Competitor auf die Nische des Projekts (siehe config.projectPurpose)?
- 0-25: anderer Markt
- 26-50: überlappt teilweise
- 51-75: starke Überlappung
- 76-100: direkter Nischen-Konkurrent

## Achse: feature (Feature-Parität)
Hat der Competitor die Kern-Features des Projekts — oder mehr?
- 0-25: deutlich weniger Features als das Projekt
- 26-50: weniger, aber Basis vorhanden
- 51-75: vergleichbarer Feature-Umfang
- 76-100: gleich viele oder mehr Features (inkl. das, was das Projekt einzigartig machen will)

## Achse: sentiment (User-Bewertungen / Resonanz)
App-Store/Review-Wertungen + Ton der öffentlichen Resonanz.
- 0-25: schlechte Bewertungen / negativer Tenor (< 3.0★ oder klar negativ)
- 26-50: gemischt (3.0-3.9★)
- 51-75: gut (4.0-4.4★)
- 76-100: exzellent (4.5★+, viele Reviews, positiver Tenor)

## Achse: etabliert (Etabliertheit)
Marktreife: User-Base, Alter, Bekanntheit.
- 0-25: Newcomer / unbekannt
- 26-50: wachsend, kleine Base
- 51-75: etabliert, solide Base
- 76-100: Marktführer / Millionen-User / langjährig

## Achse: mehrwert (User-Mehrwert)
Wahrgenommener konkreter Nutzen für den Ziel-User vs das Projekt.
- 0-25: geringer/unklarer Mehrwert
- 26-50: solider Standard-Nutzen
- 51-75: starker Mehrwert in Teilbereichen
- 76-100: herausragender, schwer zu schlagender Mehrwert

## Gewichte für threatScore
threatScore = round(
  0.25*nische + 0.25*feature + 0.15*sentiment + 0.20*etabliert + 0.15*mehrwert
)
(Summe der Gewichte = 1.0. Editierbar — bei Änderung hier UND im Skill konsistent halten.)

## relativeToProject je Achse
Vergleiche Competitor-Achsenwert gegen die eigene Einschätzung derselben Achse
(aus dem project-Profil). Projekt-Sicht:
- "ahead"  = das Projekt ist auf dieser Achse stärker
- "parity" = ungefähr gleich (±10 Punkte)
- "behind" = Competitor ist stärker (Projekt hinten)
