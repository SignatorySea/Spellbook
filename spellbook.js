document.addEventListener('DOMContentLoaded', () => {
    const selectedSpells = JSON.parse(localStorage.getItem('selectedSpells')) || [];
    const container = document.getElementById('selectedSpellsContainer');

    selectedSpells.forEach(spell => {

            //format spell printing
        switch (spell.level){
            case 0:
                formattedLevel = `${spell.school} Cantrip`;
                break;
            case 1:
                formattedLevel = `1st-level ${spell.school}`;
                break;
            case 2:
                formattedLevel = `2nd-level ${spell.school}`;
                break;
            case 3:
                formattedLevel = `3rd-level ${spell.school}`;
                break;
            case 4:
                formattedLevel = `4th-level ${spell.school}`;
                break;
            case 5:
                formattedLevel = `5th-level ${spell.school}`;
                break;
            case 6:
                formattedLevel = `6th-level ${spell.school}`;
                break;
            case 7:
                formattedLevel = `7th-level ${spell.school}`;
                break;
            case 8:
                formattedLevel = `8th-level ${spell.school}`;
                break;
            case 9:
                formattedLevel = `9th-level ${spell.school}`;
                break;
            default:
                formattedLevel = 'Invalid';
        }

        const spellDiv = document.createElement('div');
        spellDiv.classList.add('spell-container');
        spellDiv.innerHTML = `
            <h2>${spell.name}<br></h2>
            <i>${formattedLevel}</i>
            <p><strong>Casting Time:</strong> ${spell.casting_time}<br>
            <strong>Range:</strong> ${spell.range}<br>
            <strong>Components:</strong> ${spell.components}<br>
            <strong>Duration:</strong> ${spell.duration}</p><br>
            <div>${spell.description}</div><br>
            <strong>Source:</strong> ${spell.source}</p>
        `;
        container.appendChild(spellDiv);
    });
});