{"filter":false,"title":"plans.test.js","tooltip":"/src/www/account/subscriptions/plans.test.js","undoManager":{"mark":59,"position":59,"stack":[[{"start":{"row":27,"column":0},"end":{"row":45,"column":0},"action":"remove","lines":["    it('should limit plans to one page', async () => {","      const user = await TestHelper.createUser()","      for (let i = 0, len = global.PAGE_SIZE + 1; i < len; i++) {","        await TestHelper.createResetCode(user)","      }","      const req = TestHelper.createRequest('/account/subscriptions/plans', 'GET')","      req.account = user.account","      req.session = user.session","      const res = TestHelper.createResponse()","      res.end = async (str) => {","        const doc = TestHelper.extractDoc(str)","        assert.notEqual(null, doc)","        const table = doc.getElementById('reset-codes-table')","        const rows = table.getElementsByTagName('tr')","        assert.equal(rows.length, global.PAGE_SIZE + 1)","      }","      return req.route.api.get(req, res)","    })",""],"id":2},{"start":{"row":26,"column":31},"end":{"row":27,"column":0},"action":"remove","lines":["",""]}],[{"start":{"row":4,"column":8},"end":{"row":4,"column":9},"action":"insert","lines":["."],"id":4},{"start":{"row":4,"column":9},"end":{"row":4,"column":10},"action":"insert","lines":["o"]},{"start":{"row":4,"column":10},"end":{"row":4,"column":11},"action":"insert","lines":["n"]},{"start":{"row":4,"column":11},"end":{"row":4,"column":12},"action":"insert","lines":["y"]}],[{"start":{"row":4,"column":11},"end":{"row":4,"column":12},"action":"remove","lines":["y"],"id":5}],[{"start":{"row":4,"column":11},"end":{"row":4,"column":12},"action":"insert","lines":[";"],"id":6},{"start":{"row":4,"column":12},"end":{"row":4,"column":13},"action":"insert","lines":["y"]}],[{"start":{"row":4,"column":12},"end":{"row":4,"column":13},"action":"remove","lines":["y"],"id":7},{"start":{"row":4,"column":11},"end":{"row":4,"column":12},"action":"remove","lines":[";"]}],[{"start":{"row":4,"column":11},"end":{"row":4,"column":12},"action":"insert","lines":["l"],"id":8},{"start":{"row":4,"column":12},"end":{"row":4,"column":13},"action":"insert","lines":["y"]}],[{"start":{"row":20,"column":19},"end":{"row":20,"column":23},"action":"remove","lines":["true"],"id":9},{"start":{"row":20,"column":19},"end":{"row":20,"column":20},"action":"insert","lines":["2"]}],[{"start":{"row":20,"column":47},"end":{"row":20,"column":48},"action":"remove","lines":["2"],"id":10},{"start":{"row":20,"column":46},"end":{"row":20,"column":47},"action":"remove","lines":[" "]},{"start":{"row":20,"column":45},"end":{"row":20,"column":46},"action":"remove","lines":["="]},{"start":{"row":20,"column":44},"end":{"row":20,"column":45},"action":"remove","lines":[">"]},{"start":{"row":20,"column":43},"end":{"row":20,"column":44},"action":"remove","lines":[" "]}],[{"start":{"row":20,"column":43},"end":{"row":20,"column":44},"action":"insert","lines":[","],"id":11}],[{"start":{"row":20,"column":44},"end":{"row":20,"column":45},"action":"insert","lines":[" "],"id":12},{"start":{"row":20,"column":45},"end":{"row":20,"column":46},"action":"insert","lines":["2"]}],[{"start":{"row":20,"column":19},"end":{"row":20,"column":22},"action":"remove","lines":["2, "],"id":13}],[{"start":{"row":8,"column":86},"end":{"row":9,"column":0},"action":"insert","lines":["",""],"id":14},{"start":{"row":9,"column":0},"end":{"row":9,"column":6},"action":"insert","lines":["      "]}],[{"start":{"row":9,"column":6},"end":{"row":9,"column":140},"action":"insert","lines":["const plan1 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 1000, trial_period_days: 0})"],"id":15}],[{"start":{"row":10,"column":16},"end":{"row":10,"column":17},"action":"remove","lines":["1"],"id":16}],[{"start":{"row":10,"column":16},"end":{"row":10,"column":17},"action":"insert","lines":["2"],"id":17}],[{"start":{"row":11,"column":16},"end":{"row":11,"column":17},"action":"remove","lines":["2"],"id":18}],[{"start":{"row":11,"column":16},"end":{"row":11,"column":17},"action":"insert","lines":["3"],"id":19}],[{"start":{"row":9,"column":6},"end":{"row":9,"column":20},"action":"remove","lines":["const plan1 = "],"id":20}],[{"start":{"row":22,"column":45},"end":{"row":22,"column":46},"action":"remove","lines":["2"],"id":21}],[{"start":{"row":22,"column":45},"end":{"row":22,"column":46},"action":"insert","lines":["3"],"id":22}],[{"start":{"row":23,"column":45},"end":{"row":23,"column":46},"action":"remove","lines":["1"],"id":23}],[{"start":{"row":23,"column":45},"end":{"row":23,"column":46},"action":"insert","lines":["2"],"id":24}],[{"start":{"row":42,"column":42},"end":{"row":42,"column":53},"action":"remove","lines":["reset-codes"],"id":25},{"start":{"row":42,"column":42},"end":{"row":42,"column":43},"action":"insert","lines":["p"]},{"start":{"row":42,"column":43},"end":{"row":42,"column":44},"action":"insert","lines":["l"]},{"start":{"row":42,"column":44},"end":{"row":42,"column":45},"action":"insert","lines":["a"]},{"start":{"row":42,"column":45},"end":{"row":42,"column":46},"action":"insert","lines":["n"]},{"start":{"row":42,"column":46},"end":{"row":42,"column":47},"action":"insert","lines":["s"]}],[{"start":{"row":32,"column":8},"end":{"row":32,"column":46},"action":"remove","lines":["await TestHelper.createResetCode(user)"],"id":26},{"start":{"row":32,"column":8},"end":{"row":32,"column":142},"action":"insert","lines":["const plan3 = await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 2000, trial_period_days: 0})"]}],[{"start":{"row":29,"column":26},"end":{"row":31,"column":86},"action":"insert","lines":["","      const administrator = await TestHelper.createAdministrator()","      const product = await TestHelper.createProduct(administrator, {published: true})"],"id":27}],[{"start":{"row":12,"column":48},"end":{"row":13,"column":0},"action":"insert","lines":["",""],"id":28},{"start":{"row":13,"column":0},"end":{"row":13,"column":6},"action":"insert","lines":["      "]},{"start":{"row":13,"column":6},"end":{"row":13,"column":7},"action":"insert","lines":["a"]},{"start":{"row":13,"column":7},"end":{"row":13,"column":8},"action":"insert","lines":["w"]},{"start":{"row":13,"column":8},"end":{"row":13,"column":9},"action":"insert","lines":["i"]},{"start":{"row":13,"column":9},"end":{"row":13,"column":10},"action":"insert","lines":["a"]},{"start":{"row":13,"column":10},"end":{"row":13,"column":11},"action":"insert","lines":["t"]}],[{"start":{"row":13,"column":10},"end":{"row":13,"column":11},"action":"remove","lines":["t"],"id":29},{"start":{"row":13,"column":9},"end":{"row":13,"column":10},"action":"remove","lines":["a"]},{"start":{"row":13,"column":8},"end":{"row":13,"column":9},"action":"remove","lines":["i"]}],[{"start":{"row":13,"column":8},"end":{"row":13,"column":9},"action":"insert","lines":["a"],"id":30},{"start":{"row":13,"column":9},"end":{"row":13,"column":10},"action":"insert","lines":["i"]},{"start":{"row":13,"column":10},"end":{"row":13,"column":11},"action":"insert","lines":["t"]}],[{"start":{"row":13,"column":11},"end":{"row":13,"column":12},"action":"insert","lines":[" "],"id":31},{"start":{"row":13,"column":12},"end":{"row":13,"column":13},"action":"insert","lines":["T"]},{"start":{"row":13,"column":13},"end":{"row":13,"column":14},"action":"insert","lines":["e"]},{"start":{"row":13,"column":14},"end":{"row":13,"column":15},"action":"insert","lines":["s"]},{"start":{"row":13,"column":15},"end":{"row":13,"column":16},"action":"insert","lines":["t"]},{"start":{"row":13,"column":16},"end":{"row":13,"column":17},"action":"insert","lines":["H"]}],[{"start":{"row":13,"column":12},"end":{"row":13,"column":17},"action":"remove","lines":["TestH"],"id":32},{"start":{"row":13,"column":12},"end":{"row":13,"column":22},"action":"insert","lines":["TestHelper"]}],[{"start":{"row":13,"column":22},"end":{"row":13,"column":23},"action":"insert","lines":["."],"id":33},{"start":{"row":13,"column":23},"end":{"row":13,"column":24},"action":"insert","lines":["c"]},{"start":{"row":13,"column":24},"end":{"row":13,"column":25},"action":"insert","lines":["r"]},{"start":{"row":13,"column":25},"end":{"row":13,"column":26},"action":"insert","lines":["e"]},{"start":{"row":13,"column":26},"end":{"row":13,"column":27},"action":"insert","lines":["a"]},{"start":{"row":13,"column":27},"end":{"row":13,"column":28},"action":"insert","lines":["t"]},{"start":{"row":13,"column":28},"end":{"row":13,"column":29},"action":"insert","lines":["e"]},{"start":{"row":13,"column":29},"end":{"row":13,"column":30},"action":"insert","lines":["C"]},{"start":{"row":13,"column":30},"end":{"row":13,"column":31},"action":"insert","lines":["u"]},{"start":{"row":13,"column":31},"end":{"row":13,"column":32},"action":"insert","lines":["s"]},{"start":{"row":13,"column":32},"end":{"row":13,"column":33},"action":"insert","lines":["t"]},{"start":{"row":13,"column":33},"end":{"row":13,"column":34},"action":"insert","lines":["o"]},{"start":{"row":13,"column":34},"end":{"row":13,"column":35},"action":"insert","lines":["m"]},{"start":{"row":13,"column":35},"end":{"row":13,"column":36},"action":"insert","lines":["e"]},{"start":{"row":13,"column":36},"end":{"row":13,"column":37},"action":"insert","lines":["r"]}],[{"start":{"row":13,"column":37},"end":{"row":13,"column":39},"action":"insert","lines":["()"],"id":34}],[{"start":{"row":13,"column":38},"end":{"row":13,"column":39},"action":"insert","lines":["u"],"id":35},{"start":{"row":13,"column":39},"end":{"row":13,"column":40},"action":"insert","lines":["s"]},{"start":{"row":13,"column":40},"end":{"row":13,"column":41},"action":"insert","lines":["e"]},{"start":{"row":13,"column":41},"end":{"row":13,"column":42},"action":"insert","lines":["r"]}],[{"start":{"row":13,"column":43},"end":{"row":14,"column":70},"action":"remove","lines":["","      await TestHelper.createSubscription(user, administrator.plan.id)"],"id":36}],[{"start":{"row":32,"column":48},"end":{"row":33,"column":0},"action":"insert","lines":["",""],"id":37},{"start":{"row":33,"column":0},"end":{"row":33,"column":6},"action":"insert","lines":["      "]}],[{"start":{"row":33,"column":6},"end":{"row":33,"column":43},"action":"insert","lines":["await TestHelper.createCustomer(user)"],"id":38}],[{"start":{"row":35,"column":8},"end":{"row":35,"column":21},"action":"remove","lines":["const plan3 ="],"id":39}],[{"start":{"row":35,"column":8},"end":{"row":35,"column":9},"action":"remove","lines":[" "],"id":40}],[{"start":{"row":31,"column":86},"end":{"row":33,"column":43},"action":"remove","lines":["","      const user = await TestHelper.createUser()","      await TestHelper.createCustomer(user)"],"id":41}],[{"start":{"row":34,"column":7},"end":{"row":36,"column":43},"action":"insert","lines":["","      const user = await TestHelper.createUser()","      await TestHelper.createCustomer(user)"],"id":42}],[{"start":{"row":59,"column":7},"end":{"row":61,"column":43},"action":"insert","lines":["","      const user = await TestHelper.createUser()","      await TestHelper.createCustomer(user)"],"id":43}],[{"start":{"row":55,"column":12},"end":{"row":55,"column":33},"action":"remove","lines":["codes = [ user.code ]"],"id":44},{"start":{"row":55,"column":12},"end":{"row":55,"column":13},"action":"insert","lines":["p"]},{"start":{"row":55,"column":13},"end":{"row":55,"column":14},"action":"insert","lines":["l"]},{"start":{"row":55,"column":14},"end":{"row":55,"column":15},"action":"insert","lines":["a"]},{"start":{"row":55,"column":15},"end":{"row":55,"column":16},"action":"insert","lines":["n"]},{"start":{"row":55,"column":16},"end":{"row":55,"column":17},"action":"insert","lines":["s"]}],[{"start":{"row":55,"column":17},"end":{"row":55,"column":18},"action":"insert","lines":[" "],"id":45},{"start":{"row":55,"column":18},"end":{"row":55,"column":19},"action":"insert","lines":["="]}],[{"start":{"row":55,"column":19},"end":{"row":55,"column":20},"action":"insert","lines":[" "],"id":46}],[{"start":{"row":55,"column":20},"end":{"row":55,"column":22},"action":"insert","lines":["[]"],"id":47}],[{"start":{"row":53,"column":22},"end":{"row":55,"column":86},"action":"insert","lines":["","      const administrator = await TestHelper.createAdministrator()","      const product = await TestHelper.createProduct(administrator, {published: true})"],"id":48}],[{"start":{"row":60,"column":8},"end":{"row":60,"column":13},"action":"remove","lines":["codes"],"id":49},{"start":{"row":60,"column":8},"end":{"row":60,"column":13},"action":"insert","lines":["plans"]}],[{"start":{"row":60,"column":22},"end":{"row":60,"column":31},"action":"remove","lines":["user.code"],"id":50}],[{"start":{"row":60,"column":22},"end":{"row":60,"column":23},"action":"insert","lines":["p"],"id":51},{"start":{"row":60,"column":23},"end":{"row":60,"column":24},"action":"insert","lines":["l"]},{"start":{"row":60,"column":24},"end":{"row":60,"column":25},"action":"insert","lines":["a"]},{"start":{"row":60,"column":25},"end":{"row":60,"column":26},"action":"insert","lines":["n"]}],[{"start":{"row":59,"column":8},"end":{"row":59,"column":9},"action":"insert","lines":["c"],"id":52},{"start":{"row":59,"column":9},"end":{"row":59,"column":10},"action":"insert","lines":["o"]},{"start":{"row":59,"column":10},"end":{"row":59,"column":11},"action":"insert","lines":["n"]},{"start":{"row":59,"column":11},"end":{"row":59,"column":12},"action":"insert","lines":["s"]},{"start":{"row":59,"column":12},"end":{"row":59,"column":13},"action":"insert","lines":["t"]}],[{"start":{"row":59,"column":13},"end":{"row":59,"column":14},"action":"insert","lines":[" "],"id":53},{"start":{"row":59,"column":14},"end":{"row":59,"column":15},"action":"insert","lines":["p"]},{"start":{"row":59,"column":15},"end":{"row":59,"column":16},"action":"insert","lines":["l"]},{"start":{"row":59,"column":16},"end":{"row":59,"column":17},"action":"insert","lines":["a"]},{"start":{"row":59,"column":17},"end":{"row":59,"column":18},"action":"insert","lines":["n"]}],[{"start":{"row":59,"column":18},"end":{"row":59,"column":19},"action":"insert","lines":[" "],"id":54},{"start":{"row":59,"column":19},"end":{"row":59,"column":20},"action":"insert","lines":["="]}],[{"start":{"row":59,"column":20},"end":{"row":59,"column":21},"action":"insert","lines":[" "],"id":55}],[{"start":{"row":59,"column":21},"end":{"row":59,"column":59},"action":"remove","lines":["await TestHelper.createResetCode(user)"],"id":56},{"start":{"row":59,"column":21},"end":{"row":59,"column":141},"action":"insert","lines":["await TestHelper.createPlan(administrator, {productid: product.id, published: true, amount: 2000, trial_period_days: 0})"]}],[{"start":{"row":56,"column":0},"end":{"row":56,"column":48},"action":"remove","lines":["      const user = await TestHelper.createUser()"],"id":57},{"start":{"row":55,"column":86},"end":{"row":56,"column":0},"action":"remove","lines":["",""]}],[{"start":{"row":72,"column":51},"end":{"row":72,"column":56},"action":"remove","lines":["codes"],"id":58},{"start":{"row":72,"column":51},"end":{"row":72,"column":56},"action":"insert","lines":["plans"]}],[{"start":{"row":72,"column":69},"end":{"row":72,"column":75},"action":"remove","lines":["codeid"],"id":59},{"start":{"row":72,"column":69},"end":{"row":72,"column":70},"action":"insert","lines":["i"]},{"start":{"row":72,"column":70},"end":{"row":72,"column":71},"action":"insert","lines":["d"]}],[{"start":{"row":4,"column":9},"end":{"row":4,"column":13},"action":"remove","lines":["only"],"id":60},{"start":{"row":4,"column":8},"end":{"row":4,"column":9},"action":"remove","lines":["."]}],[{"start":{"row":4,"column":8},"end":{"row":4,"column":9},"action":"insert","lines":["."],"id":61},{"start":{"row":4,"column":9},"end":{"row":4,"column":10},"action":"insert","lines":["o"]},{"start":{"row":4,"column":10},"end":{"row":4,"column":11},"action":"insert","lines":["n"]},{"start":{"row":4,"column":11},"end":{"row":4,"column":12},"action":"insert","lines":["l"]},{"start":{"row":4,"column":12},"end":{"row":4,"column":13},"action":"insert","lines":["y"]}],[{"start":{"row":4,"column":9},"end":{"row":4,"column":13},"action":"remove","lines":["only"],"id":62},{"start":{"row":4,"column":8},"end":{"row":4,"column":9},"action":"remove","lines":["."]}]]},"ace":{"folds":[],"scrolltop":0,"scrollleft":0,"selection":{"start":{"row":9,"column":33},"end":{"row":9,"column":33},"isBackwards":false},"options":{"guessTabSize":true,"useWrapMode":false,"wrapToView":true},"firstLineState":0},"timestamp":1531162596966,"hash":"e32f6034ca29b085ec6e5d3f70c519a062072cec"}