self.addEventListener("push", event => {
  const data = event.data.json()
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: "/images/age.png" // your app icon
  })
})
