<h1> Project Setup </h1>
Der Server läuft mit einer Postgres-Datenbank, beide Dienste können als Docker-Container laufen gelassen werden.
Folgende Schritte sind dazu nötig:
<ol>
  <li> Docker installieren: https://docs.docker.com/desktop/?_gl=1*p0l3qq*_gcl_au*MTQwMzI4MzQyNi4xNzQ4ODQ3MTk1*_ga*MTg0NjY4NzU1My4xNzQ3NjQ1Mzc0*_ga_XJWPQMJYHQ*czE3NDg4NDcxNzEkbzIkZzEkdDE3NDg4NDcyMDEkajMwJGwwJGgw </li>
  <li> docker-compose.yml ausführen </li>
  <li> pgAdmin oder vergleichbaren DB-Client starten und auf die DB verbinden </li>
  <li> Wenn der Server gestartet ist, werden sämtliche Tabellen automatisch erstellt </li>
  <li> init-script.sql ausführen, um effect und effect_detail Tabellen zu befüllen </li>
  <li> Der Server läuft unter <a href="http://localhost:3001">localhost:3001</a>   </li>
</ol>
