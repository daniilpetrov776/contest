import { FLS } from '../functions.ts'
import { flsModules } from '../modules.ts'
import { gotoBlock } from '../scroll/gotoblock.ts'

type FormElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
type FormElementWithError = HTMLElement & {
    value?: string
    checked?: boolean
    type?: string
    dataset: DOMStringMap
}

// Валидация форм
export const formValidate = {
    getErrors(form: HTMLFormElement) {
        let error = 0
        const formRequiredItems = form.querySelectorAll<FormElement>('*[data-required]')
        if (formRequiredItems.length) {
            formRequiredItems.forEach((formRequiredItem) => {
                if (
                    (formRequiredItem.offsetParent !== null || formRequiredItem.tagName === 'SELECT') &&
                    !formRequiredItem.disabled
                ) {
                    error += this.validateInput(formRequiredItem)
                }
            })
        }
        return error
    },
    validateInput(formRequiredItem: FormElement) {
        let error = 0
        if (formRequiredItem.dataset.required === 'email') {
            formRequiredItem.value = formRequiredItem.value.replace(' ', '')
            if (this.emailTest(formRequiredItem as HTMLInputElement | HTMLTextAreaElement)) {
                this.addError(formRequiredItem as FormElementWithError)
                error++
            } else {
                this.removeError(formRequiredItem as FormElementWithError)
            }
        } else if (
            (formRequiredItem as HTMLInputElement).type === 'checkbox' &&
            !(formRequiredItem as HTMLInputElement).checked
        ) {
            this.addError(formRequiredItem as FormElementWithError)
            error++
        } else {
            if (!formRequiredItem.value.trim()) {
                this.addError(formRequiredItem as FormElementWithError)
                error++
            } else {
                this.removeError(formRequiredItem as FormElementWithError)
            }
        }
        return error
    },
    addError(formRequiredItem: FormElementWithError) {
        formRequiredItem.classList.add('_form-error')
        const parentElement = formRequiredItem.parentElement

        if (!parentElement) {
            return
        }

        parentElement.classList.add('_form-error')
        const inputError = parentElement.querySelector('.form__error')
        if (inputError) {
            parentElement.removeChild(inputError)
        }
        if (formRequiredItem.dataset.error) {
            parentElement.insertAdjacentHTML(
                'beforeend',
                `<div class="form__error">${formRequiredItem.dataset.error}</div>`
            )
        }
    },
    removeError(formRequiredItem: FormElementWithError) {
        formRequiredItem.classList.remove('_form-error')
        const parentElement = formRequiredItem.parentElement

        if (!parentElement) {
            return
        }

        parentElement.classList.remove('_form-error')
        const errorElement = parentElement.querySelector('.form__error')
        if (errorElement) {
            parentElement.removeChild(errorElement)
        }
    },
    formClean(form: HTMLFormElement) {
        form.reset()
        setTimeout(() => {
            const inputs = form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input,textarea')
            for (let index = 0; index < inputs.length; index++) {
                const el = inputs[index]
                const parentElement = el.parentElement
                if (parentElement) {
                    parentElement.classList.remove('_form-focus')
                }
                el.classList.remove('_form-focus')
                formValidate.removeError(el as FormElementWithError)
            }
            const checkboxes = form.querySelectorAll<HTMLInputElement>('.checkbox__input')
            if (checkboxes.length > 0) {
                for (let index = 0; index < checkboxes.length; index++) {
                    const checkbox = checkboxes[index]
                    checkbox.checked = false
                }
            }
            if (flsModules.select) {
                const selects = form.querySelectorAll<HTMLSelectElement>('.select select')
                if (selects.length) {
                    for (let index = 0; index < selects.length; index++) {
                        const select = selects[index]
                        flsModules.select.selectBuild(select)
                    }
                }
            }
        }, 0)
    },
    emailTest(formRequiredItem: HTMLInputElement | HTMLTextAreaElement) {
        // eslint-disable-next-line regexp/no-unused-capturing-group, regexp/no-useless-escape, regexp/no-super-linear-backtracking, regexp/optimal-quantifier-concatenation
        return !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,8})+$/.test(formRequiredItem.value)
    },
}

export function formFieldsInit(options = { viewPass: false, autoHeight: false }) {
    document.body.addEventListener('focusin', (e: FocusEvent) => {
        const targetElement = e.target as HTMLElement
        if (targetElement?.tagName === 'INPUT' || targetElement?.tagName === 'TEXTAREA') {
            if (!targetElement.hasAttribute('data-no-focus-classes')) {
                targetElement.classList.add('_form-focus')
                targetElement.parentElement?.classList.add('_form-focus')
            }
            if (targetElement.hasAttribute('data-validate')) {
                formValidate.removeError(targetElement as FormElementWithError)
            }
        }
    })
    document.body.addEventListener('focusout', (e: FocusEvent) => {
        const targetElement = e.target as HTMLElement
        if (targetElement?.tagName === 'INPUT' || targetElement?.tagName === 'TEXTAREA') {
            if (!targetElement.hasAttribute('data-no-focus-classes')) {
                targetElement.classList.remove('_form-focus')
                targetElement.parentElement?.classList.remove('_form-focus')
            }
            // Моментальная валидация
            if (targetElement.hasAttribute('data-validate')) {
                formValidate.validateInput(targetElement as FormElement)
            }
        }
    })
    // Если включено, добавляем функционал "Показать пароль"
    if (options.viewPass) {
        document.addEventListener('click', (e: MouseEvent) => {
            const targetElement = e.target as HTMLElement
            if (targetElement?.closest('[class*="__viewpass"]')) {
                const inputType = targetElement.classList.contains('_viewpass-active') ? 'password' : 'text'
                const input = targetElement.parentElement?.querySelector('input')
                if (input) {
                    input.setAttribute('type', inputType)
                }
                targetElement.classList.toggle('_viewpass-active')
            }
        })
    }
    // Если включено, добавляем функционал "Автовысота"
    if (options.autoHeight) {
        const textareas = document.querySelectorAll<HTMLTextAreaElement>('textarea[data-autoheight]')
        if (textareas.length) {
            textareas.forEach((textarea) => {
                const startHeight = textarea.hasAttribute('data-autoheight-min')
                    ? Number(textarea.dataset.autoheightMin)
                    : Number(textarea.offsetHeight)
                const maxHeight = textarea.hasAttribute('data-autoheight-max')
                    ? Number(textarea.dataset.autoheightMax)
                    : Infinity
                setHeight(textarea, Math.min(startHeight, maxHeight))
                textarea.addEventListener('input', () => {
                    if (textarea.scrollHeight > startHeight) {
                        textarea.style.height = 'auto'
                        setHeight(textarea, Math.min(Math.max(textarea.scrollHeight, startHeight), maxHeight))
                    }
                })
            })
            function setHeight(textarea: HTMLTextAreaElement, height: number) {
                textarea.style.height = `${height}px`
            }
        }
    }
}

/* Отправка форм */
export function formSubmit() {
    const forms = document.forms
    if (forms.length) {
        for (const form of forms) {
            form.addEventListener('submit', (e) => {
                const targetForm = e.target as HTMLFormElement
                if (targetForm) {
                    formSubmitAction(targetForm, e)
                }
            })
            form.addEventListener('reset', (e) => {
                const targetForm = e.target as HTMLFormElement
                if (targetForm) {
                    formValidate.formClean(targetForm)
                }
            })
        }
    }
    async function formSubmitAction(form: HTMLFormElement, e: SubmitEvent) {
        const error = !form.hasAttribute('data-no-validate') ? formValidate.getErrors(form) : 0
        if (error === 0) {
            const ajax = form.hasAttribute('data-ajax')
            if (ajax) {
                // Если режим ajax
                e.preventDefault()
                const formAction = form.getAttribute('action')?.trim() || '#'
                const formMethod = form.getAttribute('method')?.trim() || 'GET'
                const formData = new FormData(form)

                form.classList.add('_sending')
                const response = await fetch(formAction, {
                    method: formMethod,
                    body: formData,
                })
                if (response.ok) {
                    await response.json() // Получаем ответ, но не используем его
                    form.classList.remove('_sending')
                    formSent(form)
                } else {
                    form.classList.remove('_sending')
                }
            } else if (form.hasAttribute('data-dev')) {
                // Если режим разработки
                e.preventDefault()
                formSent(form)
            }
        } else {
            e.preventDefault()
            if (form.querySelector('._form-error') && form.hasAttribute('data-goto-error')) {
                const formGoToErrorClass = form.dataset.gotoError ? form.dataset.gotoError : '._form-error'
                gotoBlock(formGoToErrorClass, true, 1000)
            }
        }
    }
    // Действия после отправки формы
    function formSent(form: HTMLFormElement) {
        // Создаем событие отправки формы
        document.dispatchEvent(
            new CustomEvent('formSent', {
                detail: {
                    form,
                },
            }) as FormSentEvent
        )
        // Показываем попап, если подключен модуль попапов
        // и для формы указана настройка
        setTimeout(() => {
            if (flsModules.popup) {
                const popup = form.dataset.popupMessage
                if (popup) {
                    flsModules.popup.open(popup)
                }
            }
        }, 0)
        // Очищаем форму
        formValidate.formClean(form)
        // Сообщаем в консоль
        formLogging(`Форма отправлена!`)
    }
    function formLogging(message: string): void {
        FLS(`[Формы]: ${message}`)
    }
}
/* Модуь формы "колличество" */
export function formQuantity() {
    document.addEventListener('click', (e: MouseEvent) => {
        const targetElement = e.target as HTMLElement
        if (targetElement?.closest('[data-quantity-plus]') || targetElement?.closest('[data-quantity-minus]')) {
            const quantityWrapper = targetElement.closest('[data-quantity]')
            const valueElement = quantityWrapper?.querySelector('[data-quantity-value]') as HTMLInputElement
            if (!valueElement) {
                return
            }

            let value = Number.parseInt(valueElement.value, 10)
            if (targetElement.hasAttribute('data-quantity-plus')) {
                value++
                if (valueElement.dataset.quantityMax && +valueElement.dataset.quantityMax < value) {
                    value = +valueElement.dataset.quantityMax
                }
            } else {
                --value
                if (valueElement.dataset.quantityMin) {
                    if (+valueElement.dataset.quantityMin > value) {
                        value = +valueElement.dataset.quantityMin
                    }
                } else if (value < 1) {
                    value = 1
                }
            }
            valueElement.value = value.toString()
        }
    })
}
/* Модуь звездного рейтинга */
export function formRating() {
    const ratings = document.querySelectorAll('.rating')
    if (ratings.length > 0) {
        initRatings()
    }
    // Основная функция
    function initRatings() {
        let ratingActive, ratingValue
        // "Бегаем" по всем рейтингам на странице
        for (let index = 0; index < ratings.length; index++) {
            const rating = ratings[index]
            initRating(rating)
        }
        // Инициализируем конкретный рейтинг
        function initRating(rating) {
            initRatingVars(rating)

            setRatingActiveWidth()

            if (rating.classList.contains('rating_set')) {
                setRating(rating)
            }
        }
        // Инициализайция переменных
        function initRatingVars(rating) {
            ratingActive = rating.querySelector('.rating__active')
            ratingValue = rating.querySelector('.rating__value')
        }
        // Изменяем ширину активных звезд
        function setRatingActiveWidth(index = ratingValue.innerHTML) {
            const ratingActiveWidth = index / 0.05
            ratingActive.style.width = `${ratingActiveWidth}%`
        }
        // Возможность указать оценку
        function setRating(rating) {
            const ratingItems = rating.querySelectorAll('.rating__item')
            for (let index = 0; index < ratingItems.length; index++) {
                const ratingItem = ratingItems[index]
                ratingItem.addEventListener('mouseenter', () => {
                    // Обновление переменных
                    initRatingVars(rating)
                    // Обновление активных звезд
                    setRatingActiveWidth(ratingItem.value)
                })
                ratingItem.addEventListener('mouseleave', () => {
                    // Обновление активных звезд
                    setRatingActiveWidth()
                })
                ratingItem.addEventListener('click', () => {
                    // Обновление переменных
                    initRatingVars(rating)

                    if (rating.dataset.ajax) {
                        // "Отправить" на сервер
                        setRatingValue(ratingItem.value, rating)
                    } else {
                        // Отобразить указанную оцнку
                        ratingValue.innerHTML = index + 1
                        setRatingActiveWidth()
                    }
                })
            }
        }
        async function setRatingValue(value, rating) {
            if (!rating.classList.contains('rating_sending')) {
                rating.classList.add('rating_sending')

                // Отправика данных (value) на сервер
                const response = await fetch('rating.json', {
                    method: 'GET',

                    // body: JSON.stringify({
                    //     userRating: value
                    // }),
                    // headers: {
                    //     'content-type': 'application/json'
                    // }
                })
                if (response.ok) {
                    const result = await response.json()

                    // Получаем новый рейтинг
                    const newRating = result.newRating

                    // Вывод нового среднего результата
                    ratingValue.innerHTML = newRating

                    // Обновление активных звезд
                    setRatingActiveWidth()

                    rating.classList.remove('rating_sending')
                } else {
                    rating.classList.remove('rating_sending')
                }
            }
        }
    }
}

interface FormSentEvent extends CustomEvent {
    detail: {
        form: HTMLFormElement
    }
}
