//fetches spell data
async function fetchJSON(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching JSON:', error);
        throw error; // Rethrow the error to propagate it further
    }
}

//defines the table making function
async function populateTable() {
    try {
        const selectedFiles = Array.from(document.querySelectorAll('input[type="checkbox"].json-checkbox:checked')).map(checkbox => checkbox.value);
        if (selectedFiles.length === 0) {
            throw new Error('No JSON files selected');
        }

        const allSpells = [];
        for (const file of selectedFiles) {
            const data = await fetchJSON(file);
            if (!data || !data.spells) {
                throw new Error(`Invalid data structure in ${file}`);
            }
            allSpells.push(...data.spells);
        }

        const sortedSpells = allSpells.sort((a, b) => {
            const levelComparison = a.level - b.level;
            if (levelComparison !== 0) {
                return levelComparison;
            }
            return a.name.localeCompare(b.name);
        });

        const searchInput = document.getElementById('searchBar').value.trim().toLowerCase();

        const filteredSpells = sortedSpells.filter(spell => {
            const spellName = spell.name.toLowerCase();
            return spellName.includes(searchInput);
        });

        const tableBody = document.getElementById('spellsTable').getElementsByTagName('tbody')[0];
        tableBody.innerHTML = ''; // Clear existing table body

        filteredSpells.forEach(spell => {
            const row = document.createElement('tr');
            row.setAttribute('id', 'spellName');
            row.setAttribute('data-concentration', spell.concentration);
            row.setAttribute('data-ritual', spell.ritual);

            //add the ritual tag to the school
            let spellSchool = spell.school;
            if (spell.secondarySchool != null){
                spellSchool += ` (${spell.secondarySchool})`
            }
            if (spell.ritual) {
                spellSchool += ' (Ritual)';
            }

            //makes level "0" spells display as cantrip
            const spellLevel = spell.level === 0 ? 'Cantrip' : spell.level;

            // Check if higher_levels exists and append it to the description
            const description = spell.description;
            let fullDescription = description;
            if (spell.higher_levels) {
                 fullDescription += `<br><p><strong>Higher Levels:</strong> ${spell.higher_levels}</p>`;
            }


            // Populate table rows
            row.innerHTML = `
                <td><input type="checkbox" class="spell" /></td>
                <td id = 'spellName'>${spell.name}</td>
                <td>${spellLevel}</td>
                <td>${spellSchool}</td>
                <td>${spell.casting_time}</td>
                <td>${spell.range}</td>
                <td>${formatComponents(spell.components)}</td>
                <td>${spell.duration}</td>
                <td><div id="description">${fullDescription}</div></td>
                <td>${formatList(spell.spell_list, spell.tamer)}</td>
                <td>${spell.source} pg. ${spell.page_number}</td>
            `;

            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error('Error populating table:', error);
    }
}

//formats components for output
function formatComponents(components) {
    const parts = [];
    if (components.verbal) parts.push('V');
    if (components.somatic) parts.push('S');
    if (components.material) parts.push(`M (${components.material})`);
    return parts.join(', ');
}


//formats spellLists for output
function formatList(list, tamer){
    const array = list;

    let tamerChecked = document.getElementById("hgtmhCheckbox").checked;
    if (tamerChecked === true && tamer === true){
        array.push("Tamer");
        array.sort();
    }
    const output = array.join(", ");
    return output;
}


//makes table exist on page load
document.addEventListener('DOMContentLoaded', () => {
    // Listen for changes in checkboxes
    const checkboxes = document.querySelectorAll('.json-checkbox:checked');
    checkboxes.forEach(checkbox => checkbox.addEventListener('change', populateTable));

    // Populate table initially
    populateTable();
});

//search bar
function searchTable() {
    const searchInput = document.getElementById('searchBar').value.trim().toLowerCase();
    const rows = document.querySelectorAll('[id^="spellName"]'); // Select elements with id starting with "spellName"

    for (const row of rows) {
        const spellNameCell = row.querySelector('td[id="spellName"]'); // Find td with id "spellName"
        if (!spellNameCell) continue; // Skip if no td found (though it should be there)
        
        const spellName = spellNameCell.textContent.toLowerCase();
        const searchMatch = searchInput === '' || spellName.includes(searchInput);

        if (searchMatch) {
            row.style.display = ''; // Show the row if it matches the search criteria
        } else {
            row.style.display = 'none'; // Hide the row if it doesn't match
        }
    }
}

//filter function
function filterTable() {
    const selectedLevels = Array.from(document.querySelectorAll('input[type=checkbox].level-checkbox:checked')).map(checkbox => checkbox.value);
    const selectedClasses = Array.from(document.querySelectorAll('.list-checkbox:checked')).map(checkbox => checkbox.value);
    const selectedSchools = Array.from(document.querySelectorAll('.school-checkbox:checked')).map(checkbox => checkbox.value.toLowerCase());
    const filterRitual = document.getElementById('ritual-checkbox'); // Get the ritual checkbox
    const filterConcentration = document.getElementById('concentration-checkbox'); // Get the concentration checkbox

    const ritualBoolean = filterRitual.checked;
    const concentrationBoolean = filterConcentration.checked;

    const rows = document.getElementById('spellsTable').getElementsByTagName('tbody')[0].getElementsByTagName('tr');

    for (const row of rows) {
        let spellLevel = row.getElementsByTagName('td')[2].textContent.toLowerCase();
        const spellSchool = row.getElementsByTagName('td')[3].textContent.toLowerCase();
        const spellClasses = row.getElementsByTagName('td')[9].textContent.toLowerCase();

        // Convert "cantrip" to "0" for comparison purposes
        if (spellLevel === 'cantrip') spellLevel = '0';

        // Check if the spell is a ritual
        const isRitual = row.getAttribute('data-ritual') === 'true';
        // Check if the spell requires concentration
        const isConcentration = row.getAttribute('data-concentration') === 'true';

        const levelMatch = selectedLevels.includes(spellLevel) || selectedLevels.length === 0;
        const listMatch = selectedClasses.some(classFilter => spellClasses.includes(classFilter.toLowerCase())) || selectedClasses.length === 0;
        const schoolMatch = selectedSchools.some(school => spellSchool.includes(school)) || selectedSchools.length === 0;
        const ritualMatch = ritualBoolean ? isRitual : true; // Show rituals if the checkbox is checked
        const concentrationMatch = concentrationBoolean ? isConcentration : true; // Show concentration spells if the checkbox is checked


        if (levelMatch && listMatch && schoolMatch && ritualMatch && concentrationMatch) {
            row.style.display = ''; // Show the row if it matches the filter criteria
        } else {
            row.style.display = 'none'; // Hide the row if it doesn't match
        }
    }
}
//button for pushing to new page
function printCheckedItems() {
    const selectedSpells = [];
        const rows = document.querySelectorAll('#spellsTable tbody tr');

        rows.forEach(row => {
            const checkbox = row.querySelector('input[type="checkbox"].spell');
            if (checkbox && checkbox.checked) {
                let levelText = row.cells[2].textContent.trim();
                let level;
        
                // Convert level text to integer
                if (levelText.toLowerCase() === 'cantrip') {
                    level = 0;
                } else {
                    level = parseInt(levelText, 10);
                }
        
                const spell = {
                    name: row.cells[1].textContent,
                    level: level,
                    school: row.cells[3].textContent,
                    casting_time: row.cells[4].textContent,
                    range: row.cells[5].textContent,
                    components: row.cells[6].textContent,
                    duration: row.cells[7].textContent,
                    description: row.cells[8].innerHTML,
                    spell_list: row.cells[9].textContent,
                    source: row.cells[10].textContent
                };
                selectedSpells.push(spell);
            }
        });

        localStorage.setItem('selectedSpells', JSON.stringify(selectedSpells));
        window.location.href = 'spellbook.html';
    }