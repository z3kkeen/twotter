import './style.css'
import { supabase } from './Supabase.js'
// Auth

// Listen to auth events
supabase.auth.onAuthStateChange((event, session) => {
  if (event == 'SIGNED_IN') {
    console.log('SIGNED_IN', session)

    // Hide login
    document.querySelector("#login").classList.add("hidden")
    // Show logout
    document.querySelector("#logout > h2").innerText = session.user.email
    document.querySelector("#logout").classList.remove("hidden")
  }

  if (event == 'SIGNED_OUT') {
    // show login
    document.querySelector("#login").classList.remove("hidden")
    
    // hide login
    document.querySelector("#login").classList.add("hidden")
  }
})


// Sign in/up
const form = document.querySelector("form")

form.addEventListener("submit", async function (event) {
  const email = form[0].value
  const password = form[1].value

  event.preventDefault()

  // Login
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  // If login error
  if (signInError) {
    // If no account, sign up
    if (signInError.message === "Invalid login credentials") {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      })

      // If user already registered
      if (signUpError.message === "User already registered") {
        alert(signInError.message)
      } else {
        alert(signUpError.message)
      }
    }
  }
})

const signOutButton = document.querySelector("#logout > button")

signOutButton.addEventListener("click", async function() {
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.log(error)
  }
})

// tweets
async function getTweets() {

    // get data from database
    const { data, error } = await supabase
    .from('tuweets')
    .select(`
    id,
    message,
    created_at,
    users (
        username,
        name
    )
    `)

    if (error) {
        console.log(error)

    }

    const listEl = document.querySelector('ul')

    // loop over tweets
    for (let i of data) {
        console.log(i)
        const itemEl = document.createElement('li')
        itemEl.classList.add('flex', 'gap-4', 'border-b', 'pb-6')

        itemEl.innerHTML = `
        <div class="w-48 h-14 rounded-full">
          <img
            src="logo.png"
            alt=""
          >
        </div>
        <div>
          <div class="flex gap-2 text-gray-500">
            <span class="font-semibold text-black">${i.users.name}</span>
            <span>@${i.users.username}</span>
            <span>${new Date(i.created_at).toLocaleString()}</span>
          </div>
          <p>${i.message}</p>

          <button class="flex items-center gap-2 mt-1  hover:text-red-300">
            <i class="ph-heart text-xl"></i>
            <span class="text-sm">0</span>
          </button>
        </div>
        `
        listEl.appendChild(itemEl)
    }
}

getTweets()