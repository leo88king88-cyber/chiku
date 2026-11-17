/** Name of the existing investing app this one shares its login and KYC with. Change here to rebrand. */
export const PARENT_APP = 'Investo'

/** Demo mobile number that already has a parent-app account; any other number is treated as a new user. */
export const DEMO_MOBILE = '9876543210'

export const formatMobile = (digits: string) => (digits.length > 5 ? `${digits.slice(0, 5)} ${digits.slice(5)}` : digits)
