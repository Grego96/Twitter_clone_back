const buttonPrevent = document.querySelector(".button-prevent")
buttonPrevent.addEventListener("click", function (e) {
    e.preventDefault()
})

const siguienteBtn = document.querySelector(".siguiente-btn")

siguienteBtn.addEventListener("click", function () {
    const inputMail = document.querySelector(".input-email").value
    const nameUser = document.querySelector(".nameUser")
    nameUser.innerHTML = `Iniciar sesión como: ${inputMail}`
})
