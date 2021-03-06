/* Any copyright is dedicated to the Public Domain.
   http://creativecommons.org/publicdomain/zero/1.0/ */

// Tests that text metrics in the flame graph widget work properly.

var HTML_NS = "http://www.w3.org/1999/xhtml";
var {ELLIPSIS} = require("devtools/shared/l10n");
var {FlameGraph} = require("devtools/client/shared/widgets/FlameGraph");
var {FLAME_GRAPH_BLOCK_TEXT_FONT_SIZE} = require("devtools/client/shared/widgets/FlameGraph");
var {FLAME_GRAPH_BLOCK_TEXT_FONT_FAMILY} = require("devtools/client/shared/widgets/FlameGraph");

add_task(function* () {
  yield addTab("about:blank");
  yield performTest();
  gBrowser.removeCurrentTab();
});

function* performTest() {
  let [host, win, doc] = yield createHost();
  let graph = new FlameGraph(doc.body, 1);
  yield graph.ready();

  testGraph(graph);

  yield graph.destroy();
  host.destroy();
}

function testGraph(graph) {
  is(graph._averageCharWidth, getAverageCharWidth(),
    "The average char width was calculated correctly.");
  is(graph._overflowCharWidth, getCharWidth(ELLIPSIS),
    "The ellipsis char width was calculated correctly.");

  let text = "This text is maybe overflowing";
  let text1000px = graph._getFittedText(text, 1000);
  let text50px = graph._getFittedText(text, 50);
  let text10px = graph._getFittedText(text, 10);
  let text1px = graph._getFittedText(text, 1);

  is(graph._getTextWidthApprox(text), getAverageCharWidth() * text.length,
    "The approximate width was calculated correctly.");

  info("Text at 1000px width: " + text1000px);
  info("Text at 50px width  : " + text50px);
  info("Text at 10px width  : " + text10px);
  info("Text at 1px width   : " + text1px);

  is(text1000px, text,
    "The fitted text for 1000px width is correct.");

  isnot(text50px, text,
    "The fitted text for 50px width is correct (1).");

  ok(text50px.includes(ELLIPSIS),
    "The fitted text for 50px width is correct (2).");

  is(graph._getFittedText(text, FLAME_GRAPH_BLOCK_TEXT_FONT_SIZE + 1), ELLIPSIS,
    "The fitted text for text font size width is correct.");

  is(graph._getFittedText(text, 1), "",
    "The fitted text for 1px width is correct.");
}

function getAverageCharWidth() {
  let letterWidthsSum = 0;
  let start = 32; // space
  let end = 123; // "z"

  for (let i = start; i < end; i++) {
    let char = String.fromCharCode(i);
    letterWidthsSum += getCharWidth(char);
  }

  return letterWidthsSum / (end - start);
}

function getCharWidth(char) {
  let canvas = document.createElementNS(HTML_NS, "canvas");
  let ctx = canvas.getContext("2d");

  let fontSize = FLAME_GRAPH_BLOCK_TEXT_FONT_SIZE;
  let fontFamily = FLAME_GRAPH_BLOCK_TEXT_FONT_FAMILY;
  ctx.font = fontSize + "px " + fontFamily;

  return ctx.measureText(char).width;
}
