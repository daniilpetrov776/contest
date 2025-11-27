import datepicker from 'js-datepicker'
import { flsModules } from '../modules.ts'
import 'js-datepicker/src/datepicker'

const datepickerSelectors = document.querySelectorAll<HTMLElement>('[data-datepicker]')

if (datepickerSelectors.length) {
    datepickerSelectors.forEach((datepickerSelector) => {
        const picker = datepicker(datepickerSelector, {
            customDays: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
            customMonths: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
            overlayButton: 'Применить',
            overlayPlaceholder: 'Год (4 цифры)',
            startDay: 1,
            formatter: (input, date) => {
                const value = date.toLocaleDateString()
                input.value = value
            },
        })
        flsModules.datepicker = picker
    })
}
