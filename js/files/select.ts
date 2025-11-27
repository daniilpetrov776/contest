import NiceSelect from 'nice-select2'

function initSelects() {
    const selects = document.querySelectorAll<HTMLElement>('[data-select]')

    if (selects) {
        selects.forEach((select) => {
            new NiceSelect(select, {
                placeholder: select.dataset.placeholder,
            })
        })
    }
}

window.addEventListener('DOMContentLoaded', () => {
    initSelects()
})
