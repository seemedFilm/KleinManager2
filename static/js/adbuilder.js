class Adbuilder extends KleinManagerCore {
    constructor() {
        super();
    }

    loadAdBuilder() {
        console.log("AdBuilder geladen");
       //this.loadForm2Data();
    }
    // getForm2Values() {
    //     return {
    //         field1: document.getElementById('input1')?.value || '',
    //         field2: document.getElementById('input2')?.value || '',
    //         field3: document.getElementById('input3')?.value || '',
    //         checkbox: document.getElementById('checkbox1')?.checked || false,
    //         dropdown: document.getElementById('dropdown1')?.value || ''
    //     };
    // }

    // saveForm2Data() {
    //     const data = this.getForm2Values();
    //     console.log("Form2 gespeichert:", data);
    //     localStorage.setItem('form2Data', JSON.stringify(data));
    //     this.showToast('Formulardaten gespeichert.', 'success');
    // }

    // clearForm2Data() {
    //     ['input1', 'input2', 'input3'].forEach(id => document.getElementById(id).value = '');
    //     document.getElementById('checkbox1').checked = false;
    //     document.getElementById('dropdown1').value = '';
    //     localStorage.removeItem('form2Data');
    //     this.showToast('Formular zurÃ¼ckgesetzt.', 'warning');
    // }

    // loadForm2Data() {
    //     const saved = localStorage.getItem('form2Data');
    //     if (saved) {
    //         const data = JSON.parse(saved);
    //         document.getElementById('input1').value = data.field1 || '';
    //         document.getElementById('input2').value = data.field2 || '';
    //         document.getElementById('input3').value = data.field3 || '';
    //         document.getElementById('checkbox1').checked = data.checkbox || false;
    //         document.getElementById('dropdown1').value = data.dropdown || '';
    //     }
    // }
}

// Registrierung im Haupt-App Objekt
document.addEventListener("DOMContentLoaded", () => {
    if (window.app) {
        app.adbuilder = new Adbuilder();
        app.copyMethodsFromManager(app.adbuilder);
    }
});
