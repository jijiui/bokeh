import {ActionTool, ActionToolView} from "./action_tool"
import {CallbackLike0} from "../../callbacks/callback"
import * as p from "core/properties"
import * as icons from "styles/icons.css"

export class CustomActionView extends ActionToolView {
  declare model: CustomAction

  doit(): void {
    this.model.callback?.execute(this.model)
  }
}

export namespace CustomAction {
  export type Attrs = p.AttrsOf<Props>

  export type Props = ActionTool.Props & {
    callback: p.Property<CallbackLike0<CustomAction> | null>
  }
}

export interface CustomAction extends CustomAction.Attrs {}

export class CustomAction extends ActionTool {
  declare properties: CustomAction.Props
  declare __view_type__: CustomActionView

  constructor(attrs?: Partial<CustomAction.Attrs>) {
    super(attrs)
  }

  static {
    this.prototype.default_view = CustomActionView

    this.define<CustomAction.Props>(({Any, Nullable}) => ({
      callback: [ Nullable(Any /*TODO*/), null ],
    }))

    this.override<CustomAction.Props>({
      description: "Perform a Custom Action",
    })
  }

  override tool_name = "Custom Action"
  override tool_icon = icons.tool_icon_unknown
}
