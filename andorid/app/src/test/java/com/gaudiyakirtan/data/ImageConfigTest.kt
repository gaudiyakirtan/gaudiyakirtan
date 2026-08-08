package com.gaudiyakirtan.data

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * Unit tests for [ImageConfig]'s month-artwork resolver.
 *
 * The slug is a cross-platform contract, not a private detail: web's `monthImageUrlFor()` derives
 * the same filename, and a single dropped-in image is supposed to serve both apps. If these two
 * ever disagree, one platform silently loses its artwork with nothing to indicate why -- which is
 * indistinguishable from the (normal) case of a month that has no image at all.
 */
class ImageConfigTest {

    @Test
    fun `slug strips diacritics and lowercases`() {
        assertEquals("sridhara", ImageConfig.monthSlug("Śrīdhara"))
        assertEquals("damodara", ImageConfig.monthSlug("Dāmodara"))
        assertEquals("vamana", ImageConfig.monthSlug("Vāmana"))
    }

    @Test
    fun `slug drops every non-alphanumeric character`() {
        assertEquals("hrsikesa", ImageConfig.monthSlug("Hṛṣīkeśa"))
        assertEquals("madhusudana", ImageConfig.monthSlug("Madhu-sūdana"))
    }

    @Test
    fun `artwork uri points at the bundled asset, not the bucket`() {
        // Offline-first: the hero's artwork must not depend on the radio, and the bucket has no
        // months/ prefix to depend on in any case.
        assertEquals(
            "file:///android_asset/months/vamana.jpg",
            ImageConfig.monthArtworkUri("Vāmana")
        )
        assertTrue(ImageConfig.monthArtworkUri("Keśava").startsWith("file:///android_asset/"))
    }
}
