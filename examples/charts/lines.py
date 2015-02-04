from collections import OrderedDict
import numpy as np
import pandas as pd
from bokeh.charts import Line
from bokeh.plotting import show, output_file
from bokeh.charts import Chart, Step, Line
xyvalues = OrderedDict(
    python=[2, 3, 7, 5, 26, 221, 44, 233, 254, 265, 266, 267, 120, 111],
    pypy=[12, 33, 47, 15, 126, 121, 144, 233, 254, 225, 226, 267, 110, 130],
    jython=[22, 43, 10, 25, 26, 101, 114, 203, 194, 215, 201, 227, 139, 160],
)

# any of the following commented are valid Line inputs
#xyvalues = pd.DataFrame(xyvalues)
#xyvalues = xyvalues.values()
#xyvalues = np.array(xyvalues.values())

output_file("lines.html", title="line.py example")
chart = Line(xyvalues, title="Lines", ylabel='measures', filename="lines.html", legend=True)
show(chart)
