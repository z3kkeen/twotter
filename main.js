import './style.css'
import { supabase } from './Supabase.js'
// Auth

// Listen to auth events
supabase.auth.onAuthStateChange((event, session) => {
  const loginEl = document.querySelector("#login")
  const logoutEl = document.querySelector("#logout")
  const newTweetEl = document.querySelector("main > div")

  // if logged in
  if (event == 'SIGNED_IN') {
    console.log('SIGNED_IN', session)

    // Hide login
    loginEl.classList.add("hidden")

    // Show logout
    document.querySelector("#logout > h2").innerText = session.user.email
    logoutEl.classList.remove("hidden")

    // show new tweet
    newTweetEl.classList.remove("hidden")
  }

  // if logged out
  if (event == 'SIGNED_OUT') {

    // show login
    loginEl.classList.remove("hidden")
    
    // hide login
    logoutEl.classList.add("hidden")

    // hide new tweet
    newTweetEl.classList.add("hidden")
  }
})


// sign in
const form = document.querySelector("form")

form.addEventListener("submit", async function (event) {
  const email = form[0].value
  const password = form[1].value

  // prevents page from refreshing
  event.preventDefault()

  // login
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  // if login error
  if (signInError) {
    // if no account, sign up
    if (signInError.message === "Invalid login credentials") {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      })
      console.log(signUpData)


      // creates new user in database
      if (signUpData.user.id) {
        const { error } = await supabase
        .from('users')
        .insert({ username: signUpData.user.email })

        if(error) console.log(error)
      }

      // If user already registered, wrong password used
      if (signUpError.message === "User already registered") {
        alert(signInError.message)
      } else {
        alert(signUpError.message)
      }
    }
  }
})

// sign out
const signOutButton = document.querySelector("#logout > button")

signOutButton.addEventListener("click", async function() {
  const { error } = await supabase.auth.signOut()

  if (error) console.log(error)
})

// tweets
supabase
  .channel('public:tuweets')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tuweets' }, newTweet)
  .subscribe()

  let newTweetCount = 0

  function newTweet(e) {
    newTweetCount++

    const newTweetsEl = document.querySelector("#new-tweets")

    newTweetsEl.innerText = `Show ${newTweetCount} Tweets`
    newTweetsEl.classList.remove('hidden') 
  }

  // refresh feed
  document.querySelector('#new-tweets').addEventListener("click", function() {
    document.querySelector("#new-tweets").classList.add("hidden")
    document.querySelector('ul').replaceChildren()
    newTweetCount = 0
    getTweets()
  })

async function getTweets() {

    // get data from database
    const { data, error } = await supabase
    .from('tuweets')
    .select(`
    id,
    message,
    created_at,
    users (
      username
    )
    `).order('created_at', {ascending: false})

    if (error) {
        console.log(error)
    }

    const listEl = document.querySelector('ul')

    const { data: user } = await supabase.auth.getSession()

    // loop over tweets
    for (let i of data) {
        console.log(i)
        const itemEl = document.createElement('li')
        itemEl.classList.add('flex', 'gap-4', 'border-b', 'pb-6')

        itemEl.innerHTML = `
        <div class="h-14 rounded-full flex">
          <img
            src="logo.png"
            alt="birb"
            class="max-h-20 float-right"
          >
        </div>
        <div>
          <div class="flex gap-2 text-gray-500">
            <span class="font-semibold text-black">${i.users.username}</span>
            <span>${new Date(i.created_at).toLocaleString()}</span>
            <i class="ph-trash text-xl ${i.users.username == user.session?.user.email ? '' : 'hidden' }"></i>
          </div>
          <p>${i.message}</p>
        </div>
        `
        listEl.appendChild(itemEl)

        itemEl.addEventListener("click", async function() {
          const { error } = await supabase
            .from('tweets')
            .delete()
            .eq('id', i.id)
    
            itemEl.remove()
    
          if(error) console.log(error)
        })
    
        listEl.appendChild(itemEl)
      }
    }

getTweets()
// New tweet
document.querySelector("#twoots").addEventListener("click", async function() {
  const text = document.querySelector("textarea")
  const { data, error } = await supabase.auth.getSession()
  if (error) console.log(error)
  if (data.session.user.id) {
    const { error } = await supabase
      .from('tuweets')
      .insert({ message: text.value })
      if (error) console.log(error)
      // Clear input
      text.value = ''
  }
})