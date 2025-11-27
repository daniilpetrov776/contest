import Inputmask from 'inputmask'

const selectors = document.querySelectorAll<HTMLInputElement>('input[name="phone"]')

if (selectors.length) {
    selectors.forEach((selector) => {
        const inputmaskInstance = new Inputmask('+7 (999) 999 99 99', { showMaskOnHover: false })
        inputmaskInstance.mask(selector)
    })
}
