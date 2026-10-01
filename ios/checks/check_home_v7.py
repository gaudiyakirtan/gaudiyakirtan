#!/usr/bin/env python3
"""Linux Home checks: source contracts, corpus/assets and Swift syntax, not an Xcode build.

Run with ~/workspace/.venv/bin/python ios/checks/check_home_v7.py.
Syntax parsing requires tree-sitter and tree-sitter-swift in that shared environment.
"""
import json
from pathlib import Path
import re
import subprocess
import unittest

IOS = Path(__file__).resolve().parents[1]
ROOT = IOS.parent
APP = IOS / 'gk-ios'
HOME = APP / 'Views/HomeView'
SONGS = APP / 'Resources/songs'


def read(path):
    return path.read_text()


def color(name, dark=False):
    values = json.loads(read(APP / f'Assets.xcassets/{name}.colorset/Contents.json'))['colors']
    item = next(c for c in values if bool(c.get('appearances')) == dark)
    rgb = item['color']['components']
    return tuple(int(rgb[k], 16) / 255 if rgb[k].startswith('0x') else float(rgb[k])
                 for k in ('red', 'green', 'blue'))


def blend(foreground, background, opacity):
    return tuple(a * opacity + b * (1 - opacity) for a, b in zip(foreground, background))


def contrast(a, b):
    def luminance(rgb):
        return sum(w * (v / 12.92 if v <= .04045 else ((v + .055) / 1.055) ** 2.4)
                   for v, w in zip(rgb, (.2126, .7152, .0722)))
    low, high = sorted((luminance(a), luminance(b)))
    return (high + .05) / (low + .05)


class HomeV7Checks(unittest.TestCase):
    def test_swift_syntax_has_no_new_diagnostics(self):
        from tree_sitter import Language, Parser
        import tree_sitter_swift
        parser = Parser(Language(tree_sitter_swift.language()))
        files = sorted(IOS.rglob('*.swift'))
        baseline_only = []
        for path in files:
            current = path.read_bytes()
            if not parser.parse(current).root_node.has_error:
                continue
            previous = subprocess.run(['git', 'show', f'HEAD:{path.relative_to(ROOT)}'],
                                      cwd=ROOT, capture_output=True)
            # Report existing parser limitations only when the entire file is unchanged.
            self.assertEqual(previous.returncode, 0, f'Syntax diagnostic in new file: {path}')
            self.assertEqual(current, previous.stdout, f'Syntax diagnostic in changed file: {path}')
            self.assertTrue(parser.parse(previous.stdout).root_node.has_error)
            baseline_only.append(str(path.relative_to(IOS)))
        print(f'\nSwift syntax: {len(files)} files; unchanged baseline parser diagnostics: {baseline_only}')

    def test_rejected_dashboard_and_duplicate_progress_are_absent(self):
        source = '\n'.join(read(p) for p in HOME.glob('*.swift'))
        for forbidden in ('HomeCard', 'HomePalette', '.shadow(', 'ProgressView', 'currentTime',
                          'artistPortraitURL', 'scaledToFill', 'LazyVGrid', '.swatch(',
                          'TimelineView', 'repeatForever', 'CalendarRepository', 'Recents'):
            self.assertNotIn(forbidden, source)
        self.assertIsNone(re.search(r'0x[0-9a-fA-F]{6}|Color\(red:', source))

    def test_recommendation_identity_is_not_chosen_by_player(self):
        source = read(APP / 'Utils/HomeListeningState.swift')
        self.assertIn('song = fallbackSong', source)
        self.assertIn('currentSong?.uid == fallbackSong?.uid', source)
        self.assertIn('currentTrack != nil', source)
        self.assertIn('self.state = matchesFeaturedSong ? state : .idle', source)
        self.assertNotIn('duration', source)

    def test_reading_and_playback_are_separate_native_actions(self):
        source = read(HOME / 'HomeListenCard.swift')
        self.assertIn('NavigationLink(destination: SongDetailLoader(uid: song.uid))', source)
        self.assertIn('Label("Read & sing", systemImage: "book")', source)
        self.assertIn('Button { activate(song, track: track) }', source)
        self.assertIn('case .playing, .paused: player.togglePlayPause()', source)
        self.assertIn('case .idle, .error: player.play(song: song, track: track)', source)
        self.assertIn('.accessibilityValue(listening.status)', source)

    def test_loading_delay_cancels_and_does_not_block_reading(self):
        source = read(HOME / 'HomeListenCard.swift')
        self.assertIn('.task(id: pendingIdentity)', source)
        self.assertIn('Task.sleep(for: .milliseconds(150))', source)
        self.assertIn('Task.checkCancellation()', source)
        self.assertIn('trackUID: listening.track?.uid', source)
        self.assertEqual(source.count('.disabled('), 1)
        self.assertNotIn('Task.sleep', source[source.index('private func activate'):])

    def test_motion_and_art_have_accessibility_guards(self):
        source = read(APP / 'Utils/HomeMotion.swift')
        self.assertIn('guard !reduceMotion', source)
        self.assertIn('transaction.disablesAnimations = true', source)
        self.assertIn('active && !reduceMotion ? 2 : 0', source)
        self.assertIn('standalone && configuration.isPressed && !reduceMotion ? 0.98 : 1', source)
        feature = read(HOME / 'HomeListenCard.swift')
        art = feature[feature.index('private struct HomeRhythmField'):]
        self.assertIn('Canvas {', art)
        self.assertIn('.accessibilityHidden(true)', art)
        self.assertIn('.allowsHitTesting(false)', art)
        self.assertNotIn('player.', art)

    def test_canonical_rows_and_dynamic_reflow_remain(self):
        source = read(HOME / 'HomeSongPreview.swift')
        self.assertIn('SongListItem(entry: entry, surface: .clear, bordered: false)', source)
        feature = read(HOME / 'HomeListenCard.swift')
        self.assertIn('ViewThatFits(in: .horizontal)', feature)
        self.assertIn('.fixedSize(horizontal: false, vertical: true)', feature)
        self.assertNotIn('.lineLimit(', feature)
        discovery = read(HOME / 'HomeDiscoveryGrid.swift')
        self.assertIn('ScrollView(.horizontal)', discovery)
        self.assertIn('scaledToFit()', discovery)
        self.assertIn('dynamicTypeSize.isAccessibilitySize', discovery)
        self.assertIn('HomeTopicFlow', discovery)
        self.assertNotIn('.lineLimit(', discovery)

    def test_navigation_and_featured_reading_are_preserved(self):
        source = read(HOME / 'HomeView.swift')
        for required in ('SearchView(autofocus: true)', 'SettingsSheet(', 'ForEach(song.verses)',
                         'options: readerSettings.verseOptions()', 'homeReading: true'):
            self.assertIn(required, source)
        self.assertIn('.safeAreaInset(edge: .bottom)', read(APP / 'Navigation/AppNavigation.swift'))
        self.assertIn('.padding(.bottom, HomeSpacing.xl + HomeSpacing.lg)', source)

    def test_manifest_and_song_group_references_resolve(self):
        manifest = json.loads(read(SONGS / 'manifest.json'))
        uids = [entry['uid'] for entry in manifest]
        self.assertEqual(len(uids), len(set(uids)))
        for uid in uids:
            song = json.loads(read(SONGS / f'{uid}.json'))
            self.assertEqual(song['uid'], uid)
            self.assertTrue(song['title_main'])
        for group in json.loads(read(APP / 'Resources/song_groups.json')):
            self.assertTrue(set(group['song_uids']).issubset(uids), group['uid'])
        print(f'Corpus: {len(uids)} manifest songs decode; all group references resolve')

    def test_featured_recording_and_complete_reading_fixtures_exist(self):
        manifest = json.loads(read(SONGS / 'manifest.json'))
        suggestion = next(json.loads(read(SONGS / f'{e["uid"]}.json'))
                          for e in manifest if e['audio_available']
                          and json.loads(read(SONGS / f'{e["uid"]}.json')).get('audio_files'))
        self.assertTrue(suggestion['audio_files'][0]['filename'])
        reading = json.loads(read(SONGS / 'N9.json'))
        self.assertTrue(reading['verses'])
        for verse in reading['verses']:
            self.assertTrue(verse['display_scripts'])
        print(f'Featured recording fallback: {suggestion["uid"]}; featured reading: N9')

    def test_bundled_book_assets_reference_real_files(self):
        covers = list((APP / 'Assets.xcassets').glob('cover-book-*.imageset'))
        self.assertTrue(covers)
        for cover in covers:
            images = json.loads(read(cover / 'Contents.json'))['images']
            for image in images:
                if image.get('filename'):
                    self.assertTrue((cover / image['filename']).is_file())

    def test_home_text_and_control_contrast_in_both_palettes(self):
        minimum_body = 100
        minimum_action = 100
        for dark in (False, True):
            for surface_name in ('background', 'backgroundOffset'):
                surface = color(surface_name, dark)
                # Test resting, pressed and the worst overlap of both rhythm strokes.
                surfaces = (surface, blend(color('primaryText', dark), surface, .10),
                            blend(color('highlight', dark), surface, .10))
                for painted in surfaces:
                    for text in ('primaryText', 'secondaryText', 'tertiaryText'):
                        value = contrast(color(text, dark), painted)
                        minimum_body = min(minimum_body, value)
                        self.assertGreaterEqual(value, 4.5, (dark, text, surface_name, value))
                self.assertGreaterEqual(contrast(color('neutral', dark), surface), 3)
                self.assertGreaterEqual(contrast(color('highlight', dark), surface), 3)
            for opacity in (0, .10):
                fill = blend(color('background', dark), color('primaryText', dark), opacity)
                value = contrast(color('background', dark), fill)
                minimum_action = min(minimum_action, value)
                self.assertGreaterEqual(value, 4.5)
        feature = read(HOME / 'HomeListenCard.swift')
        self.assertIn('.foregroundStyle(Color.background)', feature)
        self.assertIn('HomeControlStyle(surface: .primaryText, stateLayer: .background', feature)
        print(f'Contrast minima: body {minimum_body:.2f}:1; reading action {minimum_action:.2f}:1')


if __name__ == '__main__':
    unittest.main(verbosity=2)
