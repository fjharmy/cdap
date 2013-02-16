/*
 * Copyright 2012-2013 Continuuity,Inc. All Rights Reserved.
 */

package com.continuuity.internal.pipeline;

import com.continuuity.pipeline.Context;
import com.continuuity.pipeline.Pipeline;
import com.continuuity.pipeline.Stage;
import com.google.common.util.concurrent.Futures;
import com.google.common.util.concurrent.ListenableFuture;
import com.google.common.util.concurrent.SettableFuture;

/**
 * Concrete implementation of synchronous {@link Pipeline}.
 * <p>
 *   Input from each {@link Stage} is passed to next {@link Stage}.
 *   Before processing to next {@link Stage}, we wait for results
 *   to be available.
 * </p>
 */
final class SynchronousPipeline extends AbstractPipeline {
  /**
   * Executes a pipeline in synchronous mode.
   * <p>
   *   Waits for the results of previous to be available to move to next
   *   stage of processing.
   * </p>
   * @param o argument to run the pipeline.
   */
  @Override
  public ListenableFuture<?> execute(Object o) throws Exception {
    Object input = o;
    Object output = null;
    for(Stage stage : getStages()) {
      Context ctx = new StageContext(input);
      stage.process(ctx);
      output = ctx.getDownStream();
      input = output;  // Output of previous stage is input to next stage.
    }
    return Futures.immediateFuture(output);
  }

}
