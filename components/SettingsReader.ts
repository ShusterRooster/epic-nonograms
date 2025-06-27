export interface ThemeSetting {
  var: string,
  value: string,
  name?: string,
  desc?: string
}

export default class SettingsReader {
  /** Gets the theme from the Nuxt Content collection 'theme' and returns a JSON-ified version of the data for easy parsing **/
  static async getTheme(): Promise<ThemeSetting[]> {
    const { data: page } = await useAsyncData('themeData', () =>
      queryCollection('theme').first())

    //this works for some reason
    const theme = page.value!.meta.body as any
    const arr: ThemeSetting[] = []

    for (const key of theme) {
      arr.push(key)
    }

    return arr
  }

  /** Gets each cookie by its name and returns the array **/
  static getThemeFromCookies(theme: ThemeSetting[]) {
    const arr: ThemeSetting[] = []

    for (const t of theme) {
      arr.push({
        var: t.var,
        value: useCookie(t.var).value!
      })
    }

    return arr
  }

  static async checkCookies() {
    const theme = await this.getTheme()

    //first time setup, cookies are not set
    if (!this.cookiesSet(theme)) {
      this.setAllCookies(theme, true)
      console.log("Theme cookies set for first time and applied to theme!")
      return
    }

    //cookies are set but theme is not applied
    if (!this.themeAppliedInCSS(theme)) {
      this.applyThemeFromCookies(theme)
    }
  }

  /** Sets all cookies from a given theme **/
  static setAllCookies(theme: ThemeSetting[], apply = true) {
    for (const cookie of theme) {
      this.updateCookie(cookie.var, cookie.value, apply)
    }
  }

  static updateCookie(name: string, val: string, apply = true) {
    useCookie(name).value = val
    if (apply) this.applyCookie(name, val)
  }

  static applyCookie(name: string, val: string) {
    document.documentElement.style.setProperty(name, val)
  }

  static applyThemeFromCookies(theme: ThemeSetting[]) {
    for (const cookie of this.getThemeFromCookies(theme)) {
      this.applyCookie(cookie.var, cookie.value)
    }
  }

  /** Checks if the CSS rules specified in the theme are set **/
  static themeAppliedInCSS(theme: ThemeSetting[]) {
    const style = window.getComputedStyle(document.documentElement)
    for (const setting of theme) {
      //if empty string, it is not set
      if (style.getPropertyValue(setting.var).length == 0)
        return false
    }

    return true
  }

  static cookiesSet(theme: ThemeSetting[]) {
    for (const setting of theme) {
      if (!useCookie(setting.var).value)
        return false
    }

    return true
  }

  /** Checks to see if cookies are loaded and will load them if not.**/
  static async checkCookies2() {
    const themeCookie = useCookie('theme')

    if (themeCookie.value == undefined) {
      themeCookie.value = JSON.stringify(await this.getTheme())
      console.log("Theme cookies set for first time!")
    }
    else {
      console.log("Theme cookies already set, must apply styles")
      //this.applyCookieTheme(themeCookie.value)
    }

    console.log(themeCookie.value)
  }

  static async getThemePayload() {
    const arr = await this.getTheme()

    //sets state of 'theme' for extracting theme data
    useState('theme', () => arr)
    console.log(useNuxtApp().payload.data)
    await this.checkCookies()
  }

  static async applyTheme() {
    for (const key of await this.getTheme() as any) {
      document.documentElement.style.setProperty(key.var, key.value)
    }
  }

}

