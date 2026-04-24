import unittest
import sys

loader = unittest.TestLoader()
suite = loader.discover('.', pattern='test_collision.py')

runner = unittest.TextTestRunner(verbosity=2)
result = runner.run(suite)

sys.exit(0 if result.wasSuccessful() else 1)
