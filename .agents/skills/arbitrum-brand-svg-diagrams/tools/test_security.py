"""Run with python3 test_security.py; all fixtures stay in private temporary directories."""
import contextlib
import io
import math
import os
from pathlib import Path
import tempfile
import types
import unittest
from unittest.mock import patch
import xml.etree.ElementTree as ET


def load(path):
    # Avoid writing __pycache__ into the skills directory.
    module = types.ModuleType(path.stem)
    module.__file__ = str(path)
    exec(compile(path.read_text(), str(path), 'exec'), module.__dict__)
    return module


HERE = Path(__file__).resolve().parent
bridge = load(HERE / 'excalidraw_bridge.py')
contrast = load(HERE / 'check_contrast.py')
video = load(HERE.parents[1] / 'arbitrum-brand-video-explainers/examples/pga-rounds/build.py')


class HelperSecurityTests(unittest.TestCase):
    def element(self, kind='rectangle', **properties):
        return dict(type=kind, x=0, y=0, width=100, height=30, **properties)

    def test_rejects_attribute_and_resource_injection_in_colors(self):
        for kind, field in [('rectangle', 'backgroundColor'), ('arrow', 'strokeColor'), ('text', 'strokeColor')]:
            for payload in ['#fff" data-proof="injected', 'url(https://example.invalid/paint)', '<script/>']:
                with self.subTest(kind=kind, payload=payload), self.assertRaises(ValueError):
                    bridge.excalidraw_to_svg({'elements': [self.element(kind, **{field: payload})]})

    def test_rejects_invalid_numeric_scene_properties(self):
        for field, value in [('x', math.inf), ('y', math.nan), ('width', -1), ('height', '12'), ('fontSize', '16" data-proof="injected')]:
            element = self.element('text')
            element[field] = value
            with self.subTest(field=field), self.assertRaises(ValueError):
                bridge.excalidraw_to_svg({'elements': [element]})
        with self.assertRaises(ValueError):
            bridge.excalidraw_to_svg({'elements': [self.element('arrow', points=[[0, 0], [0, math.inf]])]})

    def test_valid_text_round_trips_without_markup_injection(self):
        label = '<script>& "quoted"'
        svg = bridge.excalidraw_to_svg({'elements': [self.element('text', text=label, strokeColor='#fff')]})
        root = ET.fromstring(svg)
        self.assertEqual(root.find('{http://www.w3.org/2000/svg}text').text, label)
        self.assertIsNone(root.find('{http://www.w3.org/2000/svg}script'))

    def test_contrast_intermediates_are_unique_and_cleaned(self):
        with tempfile.TemporaryDirectory() as work:
            source = Path(work) / 'input.svg'
            source.write_text('<svg/>')
            outputs = []
            def render(svg, png):
                outputs.append(Path(png))
                self.assertEqual(Path(svg).parent, Path(png).parent)
                self.assertEqual(Path(svg).parent.stat().st_mode & 0o077, 0)
            with patch.object(contrast, 'render', render), patch.object(contrast, 'read_ppm', return_value=(1, 1, bytes([255, 255, 255]))), contextlib.redirect_stdout(io.StringIO()):
                self.assertEqual(contrast.main(str(source)), 0)
                self.assertEqual(contrast.main(str(source)), 0)
            self.assertNotEqual(outputs[0].parent, outputs[1].parent)
            self.assertFalse(outputs[0].parent.exists())
            self.assertFalse(outputs[1].parent.exists())

    def test_video_default_directories_are_unique(self):
        with tempfile.TemporaryDirectory() as work, patch.object(video.tempfile, 'tempdir', work), patch.object(video.sys, 'argv', ['build.py']):
            first, second = video._work_dir(), video._work_dir()
            self.assertNotEqual(first, second)
            video._safe_dir(first)
            video._safe_dir(second)

    def test_video_refuses_symlink_and_hardlink_outputs_without_overwrite(self):
        with tempfile.TemporaryDirectory() as work:
            root = Path(work).resolve()
            victim = root / 'sentinel.svg'
            victim.write_text('sentinel')
            link = root / 'probe.svg'
            link.symlink_to(victim)
            with self.assertRaises(OSError):
                video._write_svg(link, '<svg/>')
            hardlink = root / 'hardlink.svg'
            os.link(victim, hardlink)
            with self.assertRaises(ValueError):
                video._write_svg(hardlink, '<svg/>')
            self.assertEqual(victim.read_text(), 'sentinel')
            redirected = root / 'f'
            redirected.symlink_to(root, target_is_directory=True)
            with self.assertRaises(ValueError):
                video._safe_dir(redirected)

    def test_video_cleanup_refuses_redirected_frames_and_preserves_sentinel(self):
        with tempfile.TemporaryDirectory() as work:
            root = Path(work).resolve()
            out = root / 'out'
            out.mkdir()
            victim = root / 'victim'
            victim.mkdir()
            sentinel = victim / 'old.svg'
            sentinel.write_text('sentinel')
            (out / 'f').symlink_to(victim, target_is_directory=True)
            with patch.object(video, '_work_dir', return_value=out), patch.object(video, 'build'), patch.object(video, 'KEYS', []), patch.object(video.sys, 'argv', ['build.py']), contextlib.redirect_stdout(io.StringIO()):
                with self.assertRaises(ValueError):
                    video.main()
            self.assertEqual(sentinel.read_text(), 'sentinel')

    def test_explicit_output_supports_safe_macos_temp_alias(self):
        if not Path('/tmp').is_symlink() or Path('/tmp').resolve() != Path('/private/tmp'):
            self.skipTest('macOS /tmp alias is not present')
        with tempfile.TemporaryDirectory(dir='/tmp') as work:
            aliased = Path('/tmp') / Path(work).name / 'frames'
            self.assertEqual(video._safe_dir(aliased), Path('/private/tmp') / Path(work).name / 'frames')


if __name__ == '__main__':
    unittest.main()
