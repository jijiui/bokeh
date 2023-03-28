import * as sinon from "sinon"
import {expect} from "assertions"

import {CustomJS} from "@bokehjs/models/callbacks/customjs"
import {Range1d} from "@bokehjs/models/ranges/range1d"
import {GeneratorFunction, AsyncGeneratorFunction} from "@bokehjs/core/types"
import {logger} from "@bokehjs/core/logging"
//import {Document} from "@bokehjs/document"
//import {version as js_version} from "@bokehjs/version"

describe("CustomJS", () => {

  /*
  describe("values property", () => {
    const rng = new Range1d()
    const r = new CustomJS({args: {foo: rng}})

    it("should contain the args values", () => {
      expect(r.values).to.be.equal([rng])
    })

    it("should round-trip through document serialization", () => {
      const d = new Document()
      d.add_root(r)
      const json = d.to_json_string()
      const parsed = JSON.parse(json)
      parsed.version = js_version
      const copy = Document.from_json_string(JSON.stringify(parsed))
      const r_copy = copy.get_model_by_id(r.id)! as CustomJS
      const rng_copy = copy.get_model_by_id(rng.id)! as CustomJS
      expect(r.values).to.be.equal([rng])
      expect(r_copy.values).to.be.equal([rng_copy])
    })

    it("should update when args changes", () => {
      const rng2 = new Range1d()
      r.args = {foo: rng2}
      expect(r.values).to.be.equal([rng2])
    })
  })
  */

  describe("state property", () => {

    it("should support JS code", async () => {
      const cb = new CustomJS({code: "return 10"})
      const {func, module} = await cb.state()
      expect(func).to.be.instanceof(Function)
      expect(func.toString()).to.be.equal("function () { [native code] }") // due to bind()
      expect(module).to.be.equal(false)
    })

    it("should support ES module with a default function", async () => {
      const cb = new CustomJS({code: "export default function(args, obj, data) { return 10 }"})
      const {func, module} = await cb.state()
      expect(func).to.be.instanceof(Function)
      expect(func.toString()).to.be.equal("function(args, obj, data) { return 10 }")
      expect(module).to.be.equal(true)
    })

    it("should support ES module with a default arrow function", async () => {
      const cb = new CustomJS({code: "export default (args, obj, data) => 10"})
      const {func, module} = await cb.state()
      expect(func).to.be.instanceof(Function)
      expect(func.toString()).to.be.equal("(args, obj, data) => 10")
      expect(module).to.be.equal(true)
    })

    it("should support ES module with a default async function", async () => {
      const cb = new CustomJS({code: "export default async function(args, obj, data) { return 10 }"})
      const {func, module} = await cb.state()
      expect(func).to.be.instanceof(Function)
      expect(func.toString()).to.be.equal("async function(args, obj, data) { return 10 }")
      expect(module).to.be.equal(true)
    })

    it("should support ES module with a default async arrow function", async () => {
      const cb = new CustomJS({code: "export default async (args, obj, data) => 10"})
      const {func, module} = await cb.state()
      expect(func).to.be.instanceof(Function)
      expect(func.toString()).to.be.equal("async (args, obj, data) => 10")
      expect(module).to.be.equal(true)
    })

    it("should support ES module with a default generator function", async () => {
      const cb = new CustomJS({code: "export default function*(args, obj, data) { yield 5; return 10 }"})
      const {func, module} = await cb.state()
      expect(func).to.be.instanceof(GeneratorFunction)
      expect(func.toString()).to.be.equal("function*(args, obj, data) { yield 5; return 10 }")
      expect(module).to.be.equal(true)
    })

    it("should support ES module with a default async generator function", async () => {
      const cb = new CustomJS({code: "export default async function*(args, obj, data) { yield 5; return 10 }"})
      const {func, module} = await cb.state()
      expect(func).to.be.instanceof(AsyncGeneratorFunction)
      expect(func.toString()).to.be.equal("async function*(args, obj, data) { yield 5; return 10 }")
      expect(module).to.be.equal(true)
    })

    it("should support ES module bad deafult export", async () => {
      const cb = new CustomJS({code: "const some = 10;\nexport default some"})
      const logger_spy = sinon.spy(logger, "warn")
      try {
        const {func, module} = await cb.state()
        expect(func).to.be.instanceof(Function)
        expect(func.toString()).to.be.equal("() => undefined")
        expect(module).to.be.equal(true)
        expect(logger_spy.calledOnceWith("custom ES module didn't export a default function"))
      } finally {
        logger_spy.restore()
      }
    })
  })

  describe("execute method", () => {

    it("should execute the code and return the result", async () => {
      const r = new CustomJS({code: "return 10"})
      const obj = new Range1d({start: 1, end: 2})
      expect(await r.execute(obj)).to.be.equal(10)
    })

    it("should execute the code with args parameters passed", async () => {
      const r = new CustomJS({args: {foo: 5}, code: "return 10 + foo"})
      const obj = new Range1d({start: 1, end: 2})
      expect(await r.execute(obj)).to.be.equal(15)
    })

    it("should return the cb_obj passed an args parameter to execute", async () => {
      const r = new CustomJS({code: "return cb_obj"})
      const obj = new Range1d({start: 1, end: 2})
      expect(await r.execute(obj)).to.be.equal(obj)
    })

    it("should return cb_data with default value if cb_data kwarg is unset", async () => {
      const r = new CustomJS({code: "return cb_data"})
      const obj = new Range1d({start: 1, end: 2})
      expect(await r.execute(obj)).to.be.equal({})
    })

    it("should return cb_data with value of kwarg parameter to execute", async () => {
      const r = new CustomJS({code: "return cb_data.foo"})
      const obj = new Range1d({start: 1, end: 2})
      expect(await r.execute(obj, {foo: "bar"})).to.be.equal("bar")
    })

    it("should execute the code with args parameters correctly mapped", async () => {
      // The point of this test is that we shouldn't be relying on the definition
      // order of keys in a JS object, though it is reliable in some JS runtimes.
      const r = new CustomJS({
        args: {
          foo4: "foo4",
          foo5: "foo5",
          foo6: "foo6",
          foo1: "foo1",
          foo2: "foo2",
          foo3: "foo3",
        },
        code: "return [foo1, foo2, foo3, foo4, foo5, foo6]",
      })
      const obj = new Range1d({start: 1, end: 2})
      expect(await r.execute(obj)).to.be.equal(["foo1", "foo2", "foo3", "foo4", "foo5", "foo6"])
    })
  })
})
