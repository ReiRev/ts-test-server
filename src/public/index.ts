window.addEventListener('DOMContentLoaded', (event) => {
  document.querySelectorAll('.user').forEach((elem) => {
    elem.addEventListener('click', (event) => {
      const targetElement = event.target as HTMLElement
      console.log(targetElement?.innerHTML)
    })
  })
})
