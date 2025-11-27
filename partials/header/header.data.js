export const headerContext = {
    ariaLabel: 'Основная навигация',
    logo: {
        text: 'Only',
        href: '/',
        ariaLabel: 'Only — на главную',
    },
    nav: {
        ariaLabel: 'Главное меню',
        items: [
            { label: 'проекты', href: '#projects', ariaLabel: 'Перейти к разделу проекты' },
            { label: 'компания', href: '#company', ariaLabel: 'Перейти к разделу компания' },
            { label: 'направления', href: '#directions', ariaLabel: 'Перейти к разделу направления' },
            { label: 'контакты', href: '#contacts', ariaLabel: 'Перейти к разделу контакты' },
            { label: 'блог', href: '#blog', ariaLabel: 'Перейти к разделу блог' },
            { label: 'карьера', href: '#career', ariaLabel: 'Перейти к разделу карьера' },
        ],
    },
    actions: {
        toggle: {
            ariaLabel: 'Открыть меню',
            icon: '✺',
        },
    },
}
