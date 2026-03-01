import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    let config = await db.siteConfig.findFirst()

    if (!config) {
      config = await db.siteConfig.create({
        data: {
          siteTitle: 'Black Bear Gestun',
          ownerName: 'Platform Owner',
          ownerEmail: 'owner@gestun.com',
          contactWhatsApp: '081234567890'
        }
      })
    }

    return NextResponse.json({ config })
  } catch (error: any) {
    console.error('Site config GET error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    console.log('PUT /api/site-config received data:', JSON.stringify(body, null, 2))

    const {
      siteTitle,
      logoUrl,
      faviconUrl,
      metaTitle,
      metaDescription,
      ownerName,
      ownerEmail,
      ownerPassword,
      contactWhatsApp,
      contactInstagram,
      contactFacebook,
      maintenanceMode
    } = body

    let config = await db.siteConfig.findFirst()

    if (!config) {
      console.log('Creating new SiteConfig...')
      const createData: any = {
        siteTitle,
        logoUrl: logoUrl || null,
        faviconUrl: faviconUrl || null,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        ownerName,
        ownerEmail,
        contactWhatsApp,
        contactInstagram: contactInstagram || null,
        contactFacebook: contactFacebook || null,
        maintenanceMode: maintenanceMode || false
      }

      if (ownerPassword) {
        createData.ownerPassword = ownerPassword
      }

      console.log('Create data:', JSON.stringify(createData, null, 2))
      config = await db.siteConfig.create({ data: createData })
    } else {
      console.log('Updating existing SiteConfig with id:', config.id)
      const updateData: any = {}

      if (siteTitle) updateData.siteTitle = siteTitle
      if (logoUrl !== undefined) updateData.logoUrl = logoUrl
      if (faviconUrl !== undefined) updateData.faviconUrl = faviconUrl
      if (metaTitle !== undefined) updateData.metaTitle = metaTitle
      if (metaDescription !== undefined) updateData.metaDescription = metaDescription
      if (ownerName) updateData.ownerName = ownerName
      if (ownerEmail) updateData.ownerEmail = ownerEmail
      if (ownerPassword) updateData.ownerPassword = ownerPassword
      if (contactWhatsApp) updateData.contactWhatsApp = contactWhatsApp
      if (contactInstagram !== undefined) updateData.contactInstagram = contactInstagram
      if (contactFacebook !== undefined) updateData.contactFacebook = contactFacebook
      if (maintenanceMode !== undefined) updateData.maintenanceMode = maintenanceMode

      console.log('Update data:', JSON.stringify(updateData, null, 2))
      config = await db.siteConfig.update({
        where: { id: config.id },
        data: updateData
      })
    }

    console.log('SiteConfig saved successfully:', JSON.stringify(config, null, 2))
    return NextResponse.json({ success: true, config })
  } catch (error: any) {
    console.error('Site config PUT error:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    })
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
